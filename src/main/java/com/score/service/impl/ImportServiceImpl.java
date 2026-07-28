package com.score.service.impl;

import com.score.common.StageEnum;
import com.score.dto.ImportResultVO;
import com.score.dto.PlayerScoreDTO;
import com.score.service.ImportService;
import com.score.service.PlayerScoreService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

/**
 * 数据导入服务实现
 * 支持 Excel(.xlsx) 和 CSV 格式
 *
 * Excel 列顺序（表头行）：
 * 0. 战队名称
 * 1. 选手名称
 * 2. 赛程阶段（常规赛/复活赛/季后赛/总决赛）
 * 3. 场次
 * 4. 日期 (yyyy-MM-dd)
 * 5. 身份
 * 6. 版型
 * 7. 胜负分
 * 8. 投票分
 * 9. 技能分
 * 10. 违规分
 * 11. 额外分
 * 12. 是否MVP (是/否)
 * 13. 是否SVP (是/否)
 * 14. 是否背锅 (是/否)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ImportServiceImpl implements ImportService {

    private final PlayerScoreService playerScoreService;
    private final DataResolveService dataResolveService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Override
    public ImportResultVO importExcel(MultipartFile file, Long seasonId, boolean skipDuplicate) {
        List<PlayerScoreDTO> dtoList = new ArrayList<>();
        List<ImportResultVO.ImportFailRow> failRows = new ArrayList<>();
        int total = 0;

        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            int lastRowNum = sheet.getLastRowNum();
            // 第0行是表头，从第1行开始
            for (int i = 1; i <= lastRowNum; i++) {
                Row row = sheet.getRow(i);
                if (row == null || isRowEmpty(row)) continue;
                total++;
                try {
                    PlayerScoreDTO dto = parseExcelRow(row, seasonId);
                    dtoList.add(dto);
                } catch (Exception e) {
                    failRows.add(ImportResultVO.ImportFailRow.builder()
                            .rowNum(i + 1)
                            .reason(e.getMessage())
                            .rowData(rowToString(row))
                            .build());
                }
            }
        } catch (Exception e) {
            log.error("读取Excel文件失败", e);
            return ImportResultVO.builder()
                    .total(0).successCount(0).failCount(0).skipCount(0)
                    .failRows(List.of(ImportResultVO.ImportFailRow.builder()
                            .rowNum(0).reason("文件读取失败: " + e.getMessage()).build()))
                    .build();
        }

        int successCount = playerScoreService.batchCreate(dtoList, skipDuplicate);
        int skipCount = dtoList.size() - successCount - failRows.size();

        return ImportResultVO.builder()
                .total(total)
                .successCount(successCount)
                .failCount(failRows.size())
                .skipCount(Math.max(0, skipCount))
                .failRows(failRows)
                .build();
    }

    @Override
    public ImportResultVO importCsv(MultipartFile file, Long seasonId, boolean skipDuplicate) {
        List<PlayerScoreDTO> dtoList = new ArrayList<>();
        List<ImportResultVO.ImportFailRow> failRows = new ArrayList<>();
        int total = 0;
        int rowNum = 0;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            // 跳过表头
            reader.readLine();
            rowNum = 1;
            while ((line = reader.readLine()) != null) {
                rowNum++;
                if (line.trim().isEmpty()) continue;
                total++;
                try {
                    String[] cols = line.split(",", -1);
                    PlayerScoreDTO dto = parseCsvRow(cols, seasonId);
                    dtoList.add(dto);
                } catch (Exception e) {
                    failRows.add(ImportResultVO.ImportFailRow.builder()
                            .rowNum(rowNum)
                            .reason(e.getMessage())
                            .rowData(line)
                            .build());
                }
            }
        } catch (Exception e) {
            log.error("读取CSV文件失败", e);
            return ImportResultVO.builder()
                    .total(0).successCount(0).failCount(0).skipCount(0)
                    .failRows(List.of(ImportResultVO.ImportFailRow.builder()
                            .rowNum(0).reason("文件读取失败: " + e.getMessage()).build()))
                    .build();
        }

        int successCount = playerScoreService.batchCreate(dtoList, skipDuplicate);
        int skipCount = dtoList.size() - successCount;

        return ImportResultVO.builder()
                .total(total)
                .successCount(successCount)
                .failCount(failRows.size())
                .skipCount(Math.max(0, skipCount))
                .failRows(failRows)
                .build();
    }

    // ============== 解析方法 ==============

    private PlayerScoreDTO parseExcelRow(Row row, Long seasonId) {
        String teamName = getCellString(row.getCell(0));
        String playerName = getCellString(row.getCell(1));
        String stageStr = getCellString(row.getCell(2));
        String roundStr = getCellString(row.getCell(3));
        String dateStr = getCellString(row.getCell(4));
        String identity = getCellString(row.getCell(5));
        String version = getCellString(row.getCell(6));
        String winLoseStr = getCellString(row.getCell(7));
        String voteStr = getCellString(row.getCell(8));
        String skillStr = getCellString(row.getCell(9));
        String penaltyStr = getCellString(row.getCell(10));
        String extraStr = getCellString(row.getCell(11));
        String mvpStr = getCellString(row.getCell(12));
        String svpStr = getCellString(row.getCell(13));
        String scapegoatStr = getCellString(row.getCell(14));

        return buildDTO(teamName, playerName, stageStr, roundStr, dateStr,
                identity, version, winLoseStr, voteStr, skillStr, penaltyStr, extraStr,
                mvpStr, svpStr, scapegoatStr, seasonId);
    }

    private PlayerScoreDTO parseCsvRow(String[] cols, Long seasonId) {
        return buildDTO(
                safeGet(cols, 0),
                safeGet(cols, 1),
                safeGet(cols, 2),
                safeGet(cols, 3),
                safeGet(cols, 4),
                safeGet(cols, 5),
                safeGet(cols, 6),
                safeGet(cols, 7),
                safeGet(cols, 8),
                safeGet(cols, 9),
                safeGet(cols, 10),
                safeGet(cols, 11),
                safeGet(cols, 12),
                safeGet(cols, 13),
                safeGet(cols, 14),
                seasonId
        );
    }

    private PlayerScoreDTO buildDTO(String teamName, String playerName, String stageStr,
                                    String roundStr, String dateStr,
                                    String identity, String version,
                                    String winLoseStr, String voteStr, String skillStr,
                                    String penaltyStr, String extraStr,
                                    String mvpStr, String svpStr, String scapegoatStr,
                                    Long seasonId) {
        PlayerScoreDTO dto = new PlayerScoreDTO();
        dto.setSeasonId(seasonId);

        // 战队 & 选手：通过名称解析ID（若不存在可按需创建）
        Long teamId = dataResolveService.resolveTeamId(teamName);
        Long playerId = dataResolveService.resolvePlayerId(playerName, teamId);
        dto.setTeamId(teamId);
        dto.setPlayerId(playerId);

        // 赛程阶段
        StageEnum stage = StageEnum.of(stageStr);
        if (stage == null) {
            throw new IllegalArgumentException("赛程阶段无效: " + stageStr);
        }
        dto.setStage(stage);

        // 场次
        if (roundStr == null || roundStr.trim().isEmpty()) {
            throw new IllegalArgumentException("场次不能为空");
        }
        dto.setRoundNumber(Integer.parseInt(roundStr.trim()));

        // 日期
        if (dateStr == null || dateStr.trim().isEmpty()) {
            throw new IllegalArgumentException("日期不能为空");
        }
        try {
            dto.setMatchDate(LocalDate.parse(dateStr.trim(), DATE_FORMATTER));
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("日期格式错误(应为yyyy-MM-dd): " + dateStr);
        }

        dto.setIdentity(identity);
        dto.setVersion(version);

        dto.setWinLoseScore(parseDecimal(winLoseStr, "胜负分"));
        dto.setVoteScore(parseDecimal(voteStr, "投票分"));
        dto.setSkillScore(parseDecimal(skillStr, "技能分"));
        dto.setPenaltyScore(parseDecimal(penaltyStr, "违规分"));
        dto.setExtraScore(parseDecimal(extraStr, "额外分"));

        dto.setMvp(parseBool(mvpStr));
        dto.setSvp(parseBool(svpStr));
        dto.setScapegoat(parseBool(scapegoatStr));

        return dto;
    }

    // ============== 工具方法 ==============

    private String getCellString(Cell cell) {
        if (cell == null) return "";
        cell.setCellType(CellType.STRING);
        return cell.getStringCellValue() == null ? "" : cell.getStringCellValue().trim();
    }

    private boolean isRowEmpty(Row row) {
        for (int i = 0; i < 15; i++) {
            Cell cell = row.getCell(i);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                String val = getCellString(cell);
                if (!val.isEmpty()) return false;
            }
        }
        return true;
    }

    private String rowToString(Row row) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < Math.min(5, row.getLastCellNum() + 1); i++) {
            if (i > 0) sb.append(",");
            sb.append(getCellString(row.getCell(i)));
        }
        return sb.toString();
    }

    private String safeGet(String[] arr, int index) {
        if (index >= arr.length) return "";
        return arr[index] == null ? "" : arr[index].trim();
    }

    private BigDecimal parseDecimal(String val, String fieldName) {
        if (val == null || val.trim().isEmpty()) return BigDecimal.ZERO;
        try {
            return new BigDecimal(val.trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(fieldName + "格式错误: " + val);
        }
    }

    private Boolean parseBool(String val) {
        if (val == null) return false;
        String v = val.trim();
        return "是".equals(v) || "Y".equalsIgnoreCase(v) || "true".equalsIgnoreCase(v) || "1".equals(v);
    }
}
