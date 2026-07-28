package com.score.service.impl;

import com.score.common.StageEnum;
import com.score.dto.PageResult;
import com.score.dto.PlayerScoreDTO;
import com.score.dto.PlayerScoreQuery;
import com.score.dto.PlayerScoreVO;
import com.score.entity.Player;
import com.score.entity.PlayerScore;
import com.score.entity.Team;
import com.score.repository.PlayerRepository;
import com.score.repository.PlayerScoreRepository;
import com.score.repository.TeamRepository;
import com.score.service.PlayerScoreService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 选手得分记录 - 服务实现
 */
@Service
@RequiredArgsConstructor
public class PlayerScoreServiceImpl implements PlayerScoreService {

    private final PlayerScoreRepository playerScoreRepository;
    private final PlayerRepository playerRepository;
    private final TeamRepository teamRepository;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long create(PlayerScoreDTO dto) {
        PlayerScore entity = new PlayerScore();
        BeanUtils.copyProperties(dto, entity);
        entity.setTotalScore(entity.calculateTotalScore());
        playerScoreRepository.save(entity);
        return entity.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void update(Long id, PlayerScoreDTO dto) {
        PlayerScore entity = playerScoreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("记录不存在: " + id));
        BeanUtils.copyProperties(dto, entity, "id");
        entity.setTotalScore(entity.calculateTotalScore());
        playerScoreRepository.save(entity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        playerScoreRepository.deleteById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteBatch(List<Long> ids) {
        playerScoreRepository.deleteAllById(ids);
    }

    @Override
    public PlayerScoreVO getById(Long id) {
        PlayerScore entity = playerScoreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("记录不存在: " + id));
        return toVO(entity);
    }

    @Override
    public PageResult<PlayerScoreVO> page(PlayerScoreQuery query) {
        int pageNum = Math.max(1, query.getPageNum() == null ? 1 : query.getPageNum());
        int pageSize = query.getPageSize() == null ? 20 : query.getPageSize();

        Pageable pageable = PageRequest.of(pageNum - 1, pageSize,
                Sort.by(Sort.Direction.DESC, "matchDate", "id"));

        Specification<PlayerScore> spec = buildSpecification(query);
        Page<PlayerScore> page = playerScoreRepository.findAll(spec, pageable);

        List<PlayerScoreVO> voList = page.getContent().stream()
                .map(this::toVO)
                .collect(Collectors.toList());
        // 批量填充战队/选手信息
        fillTeamAndPlayerInfo(voList);

        return PageResult.of(voList, page.getTotalElements(), pageNum, pageSize);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int batchCreate(List<PlayerScoreDTO> list, boolean skipDuplicate) {
        int count = 0;
        for (PlayerScoreDTO dto : list) {
            boolean exists = playerScoreRepository.existsBySeasonIdAndStageAndRoundNumberAndMatchDateAndPlayerId(
                    dto.getSeasonId(), dto.getStage(), dto.getRoundNumber(),
                    dto.getMatchDate(), dto.getPlayerId());
            if (exists && skipDuplicate) {
                continue;
            }
            PlayerScore entity = new PlayerScore();
            BeanUtils.copyProperties(dto, entity);
            entity.setTotalScore(entity.calculateTotalScore());
            playerScoreRepository.save(entity);
            count++;
        }
        return count;
    }

    // ============== 私有方法 ==============

    private Specification<PlayerScore> buildSpecification(PlayerScoreQuery query) {
        return (root, criteriaQuery, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (query.getSeasonId() != null) {
                predicates.add(cb.equal(root.get("seasonId"), query.getSeasonId()));
            }
            if (query.getTeamId() != null) {
                predicates.add(cb.equal(root.get("teamId"), query.getTeamId()));
            }
            if (query.getPlayerId() != null) {
                predicates.add(cb.equal(root.get("playerId"), query.getPlayerId()));
            }
            if (query.getStage() != null) {
                predicates.add(cb.equal(root.get("stage"), query.getStage()));
            }
            if (query.getRoundNumber() != null) {
                predicates.add(cb.equal(root.get("roundNumber"), query.getRoundNumber()));
            }
            if (query.getStartDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("matchDate"), query.getStartDate()));
            }
            if (query.getEndDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("matchDate"), query.getEndDate()));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private PlayerScoreVO toVO(PlayerScore entity) {
        PlayerScoreVO vo = new PlayerScoreVO();
        BeanUtils.copyProperties(entity, vo);
        if (entity.getStage() != null) {
            vo.setStageLabel(entity.getStage().getLabel());
        }
        return vo;
    }

    private void fillTeamAndPlayerInfo(List<PlayerScoreVO> list) {
        if (list == null || list.isEmpty()) return;

        Set<Long> teamIds = list.stream().map(PlayerScoreVO::getTeamId)
                .filter(Objects::nonNull).collect(Collectors.toSet());
        Set<Long> playerIds = list.stream().map(PlayerScoreVO::getPlayerId)
                .filter(Objects::nonNull).collect(Collectors.toSet());

        Map<Long, Team> teamMap = teamRepository.findAllById(teamIds).stream()
                .collect(Collectors.toMap(Team::getId, t -> t));
        Map<Long, Player> playerMap = playerRepository.findAllById(playerIds).stream()
                .collect(Collectors.toMap(Player::getId, p -> p));

        for (PlayerScoreVO vo : list) {
            Team team = teamMap.get(vo.getTeamId());
            if (team != null) {
                vo.setTeamName(team.getName());
                vo.setTeamLogo(team.getLogo());
            }
            Player player = playerMap.get(vo.getPlayerId());
            if (player != null) {
                vo.setPlayerName(player.getName());
                vo.setPlayerAvatar(player.getAvatar());
            }
        }
    }
}
