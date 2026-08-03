package com.score.service.impl;

import com.score.common.StageEnum;
import com.score.dto.PlayerRecordDTO;
import com.score.dto.PlayerRecordListVO;
import com.score.dto.PlayerRecordVO;
import com.score.entity.Player;
import com.score.entity.PlayerScore;
import com.score.entity.Season;
import com.score.entity.Team;
import com.score.repository.PlayerRepository;
import com.score.repository.PlayerScoreRepository;
import com.score.repository.SeasonRepository;
import com.score.repository.TeamRepository;
import com.score.service.PlayerRecordService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 选手数据记录服务实现
 * 底层仍使用 Season/Team/Player/PlayerScore 分表存储，本层负责扁平结构与分表结构之间的转换，
 * 以及按名称自动查找/创建赛季、战队、选手（不存在时自动创建，逻辑与 Excel/CSV 导入保持一致）
 */
@Service
@RequiredArgsConstructor
public class PlayerRecordServiceImpl implements PlayerRecordService {

    private final PlayerScoreRepository playerScoreRepository;
    private final PlayerRepository playerRepository;
    private final TeamRepository teamRepository;
    private final SeasonRepository seasonRepository;
    private final DataResolveService dataResolveService;

    @Override
    public PlayerRecordListVO findAll(String season, String stage, String keyword) {
        Long seasonId = null;
        if (StringUtils.hasText(season)) {
            seasonId = seasonRepository.findByName(season.trim()).map(Season::getId).orElse(null);
            if (seasonId == null) {
                return new PlayerRecordListVO(Collections.emptyList(), 0);
            }
        }

        StageEnum stageEnum = null;
        if (StringUtils.hasText(stage)) {
            stageEnum = StageEnum.of(stage.trim());
            if (stageEnum == null) {
                return new PlayerRecordListVO(Collections.emptyList(), 0);
            }
        }

        Long finalSeasonId = seasonId;
        StageEnum finalStage = stageEnum;
        Specification<PlayerScore> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (finalSeasonId != null) {
                predicates.add(cb.equal(root.get("seasonId"), finalSeasonId));
            }
            if (finalStage != null) {
                predicates.add(cb.equal(root.get("stage"), finalStage));
            }
            query.orderBy(cb.desc(root.get("createTime")));
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<PlayerRecordVO> list = toRecordVOList(playerScoreRepository.findAll(spec));

        if (StringUtils.hasText(keyword)) {
            String kw = keyword.trim().toLowerCase();
            list = list.stream()
                    .filter(v -> (v.getPlayerName() != null && v.getPlayerName().toLowerCase().contains(kw))
                            || (v.getTeamName() != null && v.getTeamName().toLowerCase().contains(kw)))
                    .collect(Collectors.toList());
        }

        return new PlayerRecordListVO(list, list.size());
    }

    @Override
    public PlayerRecordVO findOne(Long id) {
        return playerScoreRepository.findById(id)
                .map(entity -> toRecordVOList(List.of(entity)).get(0))
                .orElse(null);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PlayerRecordVO create(PlayerRecordDTO dto) {
        PlayerScore entity = new PlayerScore();
        applyDto(entity, dto);
        playerScoreRepository.save(entity);
        return findOne(entity.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PlayerRecordVO update(Long id, PlayerRecordDTO dto) {
        PlayerScore entity = playerScoreRepository.findById(id).orElse(null);
        if (entity == null) {
            return null;
        }
        applyDto(entity, dto);
        playerScoreRepository.save(entity);
        return findOne(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean remove(Long id) {
        if (!playerScoreRepository.existsById(id)) {
            return false;
        }
        playerScoreRepository.deleteById(id);
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int importBatch(List<PlayerRecordDTO> list) {
        int count = 0;
        for (PlayerRecordDTO dto : list) {
            create(dto);
            count++;
        }
        return count;
    }

    // ============== 私有方法 ==============

    private void applyDto(PlayerScore entity, PlayerRecordDTO dto) {
        Long seasonId = dataResolveService.resolveSeasonId(dto.getSeason());
        Long teamId = dataResolveService.resolveTeamId(seasonId, dto.getTeamName(), dto.getTeamLogo());
        Long playerId = dataResolveService.resolvePlayerId(dto.getPlayerName(), teamId, dto.getPlayerAvatar());
        StageEnum stage = StageEnum.of(dto.getStage());
        if (stage == null) {
            throw new IllegalArgumentException("赛程阶段无效: " + dto.getStage());
        }
        if (dto.getDate() == null) {
            throw new IllegalArgumentException("日期不能为空");
        }

        entity.setSeasonId(seasonId);
        entity.setTeamId(teamId);
        entity.setPlayerId(playerId);
        entity.setStage(stage);
        entity.setRoundNumber(dto.getRound() == null ? 1 : dto.getRound());
        entity.setMatchDate(dto.getDate());
        entity.setIdentity(dto.getIdentity());
        entity.setVersion(dto.getRole());
        entity.setVoteScore(dto.getVoteScore() == null ? BigDecimal.ZERO : dto.getVoteScore());
        entity.setWinLoseScore(dto.getWinScore() == null ? BigDecimal.ZERO : dto.getWinScore());
        entity.setSkillScore(dto.getSkillScore() == null ? BigDecimal.ZERO : dto.getSkillScore());
        entity.setPenaltyScore(dto.getPenaltyScore() == null ? BigDecimal.ZERO : dto.getPenaltyScore());
        entity.setExtraScore(dto.getExtraScore() == null ? BigDecimal.ZERO : dto.getExtraScore());
        entity.setTotalScore(entity.calculateTotalScore());
        entity.setMvp(Boolean.TRUE.equals(dto.getIsMvp()));
        entity.setSvp(Boolean.TRUE.equals(dto.getIsSvp()));
        entity.setScapegoat(Boolean.TRUE.equals(dto.getIsBlame()));
    }

    private List<PlayerRecordVO> toRecordVOList(List<PlayerScore> scores) {
        if (scores.isEmpty()) {
            return Collections.emptyList();
        }

        Set<Long> seasonIds = scores.stream().map(PlayerScore::getSeasonId).collect(Collectors.toSet());
        Set<Long> teamIds = scores.stream().map(PlayerScore::getTeamId).collect(Collectors.toSet());
        Set<Long> playerIds = scores.stream().map(PlayerScore::getPlayerId).collect(Collectors.toSet());

        Map<Long, String> seasonNameMap = seasonRepository.findAllById(seasonIds).stream()
                .collect(Collectors.toMap(Season::getId, Season::getName));
        Map<Long, Team> teamMap = teamRepository.findAllById(teamIds).stream()
                .collect(Collectors.toMap(Team::getId, t -> t));
        Map<Long, Player> playerMap = playerRepository.findAllById(playerIds).stream()
                .collect(Collectors.toMap(Player::getId, p -> p));

        return scores.stream()
                .map(s -> toRecordVO(s, seasonNameMap, teamMap, playerMap))
                .collect(Collectors.toList());
    }

    private PlayerRecordVO toRecordVO(PlayerScore s, Map<Long, String> seasonNameMap,
                                       Map<Long, Team> teamMap, Map<Long, Player> playerMap) {
        Team team = teamMap.get(s.getTeamId());
        Player player = playerMap.get(s.getPlayerId());

        PlayerRecordVO vo = new PlayerRecordVO();
        vo.setId(s.getId());
        vo.setPlayerName(player != null ? player.getName() : null);
        vo.setPlayerAvatar(player != null ? player.getAvatar() : null);
        vo.setTeamName(team != null ? team.getName() : null);
        vo.setTeamLogo(team != null ? team.getLogo() : null);
        vo.setSeason(seasonNameMap.get(s.getSeasonId()));
        vo.setStage(s.getStage() != null ? s.getStage().getLabel() : null);
        vo.setRound(s.getRoundNumber());
        vo.setDate(s.getMatchDate());
        vo.setIdentity(s.getIdentity());
        vo.setRole(s.getVersion());
        vo.setScore(s.getTotalScore());
        vo.setVoteScore(s.getVoteScore());
        vo.setWinScore(s.getWinLoseScore());
        vo.setSkillScore(s.getSkillScore());
        vo.setPenaltyScore(s.getPenaltyScore());
        vo.setExtraScore(s.getExtraScore());
        vo.setIsMvp(s.getMvp());
        vo.setIsSvp(s.getSvp());
        vo.setIsBlame(s.getScapegoat());
        vo.setCreatedAt(s.getCreateTime());
        vo.setUpdatedAt(s.getUpdateTime());
        return vo;
    }
}
