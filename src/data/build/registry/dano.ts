import DanoParser from "@/data/build/parsers/dano";
import type { EventId, ParticipationParser } from "@/data/types/base";
import { DanoTeamCriteriaType } from "@/data/types/dano";

const danoParsers: Record<EventId, ParticipationParser> = {
  dano25: new DanoParser({
    tableUrl: "https://dano.hse.ru/mirror/pubs/share/1111939507.xlsx",
    omitColumns: ["region"],
    insertColumns: [{ after: "participationGrade", columns: ["city"] }],
    soloTaskMaxScores: [6, 20, 20, 15, 15],
    teamCriterias: [
      {
        type: DanoTeamCriteriaType.TASK,
        name: "Разведывательный анализ и анализ структуры данных",
        maxScore: 3,
      },
      { type: DanoTeamCriteriaType.TASK, name: "Гипотеза", maxScore: 3 },
      {
        type: DanoTeamCriteriaType.ANALYSIS,
        name: "Математическая модель исследования",
        maxScore: 3,
      },
      {
        type: DanoTeamCriteriaType.ANALYSIS,
        name: "Визуализация",
        maxScore: 3,
      },
      {
        type: DanoTeamCriteriaType.ANALYSIS,
        name: "Интерпретация",
        maxScore: 2,
      },
      {
        type: DanoTeamCriteriaType.RESULTS,
        name: "Выводы и рекомендации",
        maxScore: 3,
      },
      {
        type: DanoTeamCriteriaType.RESULTS,
        name: "Теоретическая обоснованность исследования",
        maxScore: 2,
      },
      {
        type: DanoTeamCriteriaType.PRESENTATION,
        name: "Командная работа",
        maxScore: 2,
      },
      {
        type: DanoTeamCriteriaType.PRESENTATION,
        name: "Логика и полнота повествования",
        maxScore: 2,
      },
      {
        type: DanoTeamCriteriaType.PRESENTATION,
        name: "Общее впечатление от исследования",
        maxScore: 1,
      },
    ],
  }),
  dano24: new DanoParser({
    tableUrl: "https://dano.hse.ru/mirror/pubs/share/998256886.xlsx",
    soloTaskMaxScores: [12, 23, 25, 20, 20],
    teamCriterias: [
      {
        type: DanoTeamCriteriaType.TASK,
        name: "Предварительный анализ и анализ структуры данных",
        maxScore: 3,
      },
      {
        type: DanoTeamCriteriaType.TASK,
        name: "Гипотеза и исследовательский вопрос",
        maxScore: 2,
      },
      { type: DanoTeamCriteriaType.TASK, name: "Механизм", maxScore: 2 },
      {
        type: DanoTeamCriteriaType.ANALYSIS,
        name: "Математические методы проверки гипотезы",
        maxScore: 3,
      },
      {
        type: DanoTeamCriteriaType.ANALYSIS,
        name: "Визуализация результата",
        maxScore: 3,
      },
      {
        type: DanoTeamCriteriaType.ANALYSIS,
        name: "Интерпретация",
        maxScore: 2,
      },
      {
        type: DanoTeamCriteriaType.RESULTS,
        name: "Выводы и рекомендации",
        maxScore: 3,
      },
      {
        type: DanoTeamCriteriaType.RESULTS,
        name: "Командная работа",
        maxScore: 2,
      },
      {
        type: DanoTeamCriteriaType.RESULTS,
        name: "Общее впечатление от исследования",
        maxScore: 1,
      },
    ],
  }),
  dano23: new DanoParser({
    tableUrl: "https://dano.hse.ru/mirror/pubs/share/881446007.xlsx",
    soloTaskMaxScores: [40, 28, 16, 38, 25],
    teamCriterias: [
      {
        type: DanoTeamCriteriaType.TASK,
        name: "Предварительный анализ и анализ структуры данных",
        maxScore: 3,
      },
      {
        type: DanoTeamCriteriaType.TASK,
        name: "Гипотеза и исследовательский вопрос",
        maxScore: 2,
      },
      { type: DanoTeamCriteriaType.TASK, name: "Механизм", maxScore: 2 },
      {
        type: DanoTeamCriteriaType.ANALYSIS,
        name: "Математическая модель исследования",
        maxScore: 3,
      },
      {
        type: DanoTeamCriteriaType.ANALYSIS,
        name: "Визуализация результата",
        maxScore: 3,
      },
      {
        type: DanoTeamCriteriaType.ANALYSIS,
        name: "Интерпретация",
        maxScore: 3,
      },
      {
        type: DanoTeamCriteriaType.PRESENTATION,
        name: "Командная работа",
        maxScore: 2,
      },
      {
        type: DanoTeamCriteriaType.PRESENTATION,
        name: "Логика презентации",
        maxScore: 2,
      },
      { type: DanoTeamCriteriaType.PRESENTATION, name: "Выводы", maxScore: 3 },
    ],
    teamRowsOffset: 4,
  }),
  dano22: new DanoParser({
    tableUrl: "https://dano.hse.ru/mirror/pubs/share/841536367.xlsx",
    omitColumns: ["gender"],
    insertColumns: [{ after: "participationGrade", columns: [null] }],
    soloTaskMaxScores: [20, 20, 20, 40],
    soloRowsOffset: 2,
    teamCriterias: [
      {
        type: DanoTeamCriteriaType.TASK,
        name: "Предварительный анализ",
        maxScore: 3,
      },
      {
        type: DanoTeamCriteriaType.TASK,
        name: "Гипотеза и исследовательский вопрос",
        maxScore: 2,
      },
      { type: DanoTeamCriteriaType.TASK, name: "Механизм", maxScore: 2 },
      {
        type: DanoTeamCriteriaType.ANALYSIS,
        name: "Математическая модель исследования",
        maxScore: 3,
      },
      {
        type: DanoTeamCriteriaType.ANALYSIS,
        name: "Структура данных",
        maxScore: 2,
      },
      {
        type: DanoTeamCriteriaType.ANALYSIS,
        name: "Визуализация результата",
        maxScore: 3,
      },
      {
        type: DanoTeamCriteriaType.ANALYSIS,
        name: "Интерпретация",
        maxScore: 3,
      },
      {
        type: DanoTeamCriteriaType.PRESENTATION,
        name: "Командная работа",
        maxScore: 2,
      },
      {
        type: DanoTeamCriteriaType.PRESENTATION,
        name: "Логика презентации",
        maxScore: 2,
      },
      { type: DanoTeamCriteriaType.PRESENTATION, name: "Выводы", maxScore: 3 },
    ],
    teamRowsOffset: 4,
  }),
};

export default danoParsers;
