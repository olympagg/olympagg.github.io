import { expandMeta } from "@/data/build/meta/utils";
import type { EventMeta } from "@/data/types/base";

const base = {
  groupName: "Национальная технологическая олимпиада",
  rcsoName: "Национальная технологическая олимпиада",
  maxScore: 100,
  percentileRanking: true,
} as const;

const ntoaeroEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntoaero",
    name: "НТО: аэрокосмические системы",
    url: "https://ntcontest.ru/tracks/nto-school/kosmicheskiy-proekt/aerokosmicheskie-sistemy",
  },
  [
    {
      date: new Date("2026-04-18"),
      rcsoTrack:
        "беспилотный транспорт: аэрокосмические системы, беспилотные авиационные системы, водные робототехнические системы, летающая робототехника",
    },
    {
      date: new Date("2025-04-19"),
      rcsoTrack: "аэрокосмические системы",
    },
    { date: new Date("2024-04-13") },
  ],
);

const ntoaiEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntoai",
    name: "НТО: искусственный интеллект",
    rcsoTrack: "искусственный интеллект",
    url: "https://ntcontest.ru/tracks/nto-school/proekt-po-iskusstvennomu-intellektu/iskusstvennyy-intellekt",
  },
  [
    // NOTE: ocr (team name and grade merge)
    // { date: new Date("2026-04-18") },
    { date: new Date("2025-04-19") },
    { date: new Date("2024-04-13") },
  ],
);

const ntoamtEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntoamt",
    name: "НТО: передовые производственные технологии",
    rcsoTrack: "передовые производственные технологии",
    url: "https://ntcontest.ru",
  },
  [
    // { date: new Date("2024-04-13") },
  ],
);

const ntoarEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntoar",
    name: "НТО: технологии дополненной реальности",
    url: "https://ntcontest.ru",
  },
  [
    {
      date: new Date("2026-04-18"),
      rcsoTrack:
        "виртуальные миры: разработка компьютерных игр, технологии виртуальной реальности, технологии дополненной реальности, цифровые технологии в архитектуре",
    },
    // {
    //   date: new Date("2025-04-19"),
    //   rcsoTrack: "виртуальные миры: разработка компьютерных игр, технологии виртуальной реальности, технологии дополненной реальности",
    // },
    { date: new Date("2024-04-13") },
  ],
);

const ntoarchEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntoarch",
    name: "НТО: цифровые технологии в архитектуре",
    url: "https://ntcontest.ru/tracks/nto-school/proekt-novoy-sredy-zhizni/tsifrovye-tekhnologii-v-arkhitekture",
  },
  [
    // {
    //   date: new Date("2026-04-18"),
    //   rcsoTrack: "виртуальные миры: разработка компьютерных игр, технологии виртуальной реальности, технологии дополненной реальности, цифровые технологии в архитектуре",
    // },
    {
      date: new Date("2025-04-19"),
      rcsoTrack: "цифровые технологии в архитектуре",
    },
    // { date: new Date("2024-04-13") },
  ],
);

const ntoatsEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntoats",
    name: "НТО: автономные транспортные системы",
    rcsoTrack: "автономные транспортные системы",
    url: "https://ntcontest.ru/tracks/nto-school/proekt-novogo-transporta/avtonomnye-transportnye-sistemy",
  },
  [
    // { date: new Date("2026-04-18") },
    { date: new Date("2025-04-19") },
    // { date: new Date("2024-04-13") },
  ],
);

const ntoaviaEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntoavia",
    name: "НТО: беспилотные авиационные системы",
    url: "https://ntcontest.ru/tracks/nto-school/proekt-novogo-transporta/bespilotnye-aviatsionnye-sistemy",
  },
  [
    // {
    //   date: new Date("2026-04-18"),
    //   rcsoTrack: "беспилотный транспорт: аэрокосмические системы, беспилотные авиационные системы, водные робототехнические системы, летающая робототехника",
    // },
    {
      date: new Date("2025-04-19"),
      rcsoTrack: "беспилотные авиационные системы",
    },
    // { date: new Date("2024-04-13") },
  ],
);

const ntobdmlEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntobdml",
    name: "НТО: большие данные и машинное обучение",
    rcsoTrack: "большие данные и машинное обучение",
    url: "https://ntcontest.ru/tracks/nto-school/proekt-po-iskusstvennomu-intellektu/bolshie-dannye-i-mashinnoe-obuchenie",
  },
  [
    // { date: new Date("2026-04-18") },
    { date: new Date("2025-04-19") },
    // { date: new Date("2024-04-13") },
  ],
);

const ntobioEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntobio",
    name: "НТО: моделирование в биотехнологиях",
    url: "https://ntcontest.ru/tracks/nto-school/proekt-novoy-sredy-zhizni/biotech",
  },
  [
    // { date: new Date("2026-04-18") },
  ],
);

const ntobizEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntobiz",
    name: "НТО: технологическое предпринимательство",
    rcsoTrack: "технологическое предпринимательство",
    url: "https://ntcontest.ru",
  },
  [
    // { date: new Date("2024-04-13") },
  ],
);

const ntobpaEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntobpa",
    name: "НТО: автоматизация бизнес-процессов",
    rcsoTrack: "автоматизация бизнес-процессов",
    url: "https://ntcontest.ru/tracks/nto-school/proekt-novogo-proizvodstva/avtomatizatsiya-bisnes-protsessov",
  },
  [
    { date: new Date("2026-04-18") },
    { date: new Date("2025-04-19") },
    { date: new Date("2024-04-13") },
  ],
);

const ntobsecEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntobsec",
    name: "НТО: конструктивная безопасность",
    url: "https://ntcontest.ru/tracks/nto-school/proekt-novoy-bezopasnosti/cyber-safety",
  },
  [
    // { date: new Date("2026-04-18") },
  ],
);

const ntochemEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntochem",
    url: "https://ntcontest.ru/tracks/nto-school/proekt-novoy-meditsiny/nanosistemy-i-khimicheskiy-inzhiniring",
  },
  [
    {
      name: "НТО: наносистемы и химический инжиниринг",
      date: new Date("2026-04-18"),
      rcsoTrack: "наносистемы и химический инжиниринг",
    },
    {
      name: "НТО: наносистемы и наноинженерия",
      date: new Date("2025-04-19"),
      rcsoTrack: "наносистемы и наноинженерия",
    },
    // {
    //   name: "НТО: наносистемы и наноинженерия",
    //   date: new Date("2024-04-13"),
    //   rcsoTrack: "наносистемы и наноинженерия",
    // },
  ],
);

const ntocityEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntocity",
    name: "НТО: умный город",
    url: "https://ntcontest.ru",
  },
  [
    // {
    //   date: new Date("2026-04-18"),
    //   rcsoTrack: "умные системы и технологии: умный город, цифровые сенсорные системы",
    // },
    { date: new Date("2025-04-19") },
    // { date: new Date("2024-04-13") },
  ],
);

const ntocitynetEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntocitynet",
    name: "НТО: инженерные сети городов будущего",
    url: "https://ntcontest.ru/tracks/nto-school/proekt-novoy-sredy-zhizni/ingenet",
  },
  [{ date: new Date("2026-04-18") }],
);

const ntocsEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntocs",
    name: "НТО: информационная безопасность",
    rcsoTrack: "информационная безопасность",
    url: "https://ntcontest.ru/tracks/nto-school/proekt-novoy-bezopasnosti/informatsionnaya-bezopasnost",
  },
  [
    { date: new Date("2026-04-18") },
    { date: new Date("2025-04-19") },
    // { date: new Date("2024-04-13") },
  ],
);

const ntocvdsEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntocvds",
    name: "НТО: технологии компьютерного зрения и цифровые сервисы",
    url: "https://ntcontest.ru",
  },
  [
    // { date: new Date("2024-04-13") },
  ],
);

const ntodconEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntodcon",
    name: "НТО: цифровой инжиниринг в строительстве",
    url: "https://ntcontest.ru",
  },
  [
    // { date: new Date("2024-04-13") },
  ],
);

const ntodmmeEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntodmme",
    name: "НТО: цифровое производство в машиностроении",
    url: "https://ntcontest.ru",
  },
  [{ date: new Date("2024-04-13") }],
);

const ntoengbioEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntoengbio",
    name: "НТО: инженерные биологические системы",
    rcsoTrack: "инженерные биологические системы",
    url: "https://ntcontest.ru/tracks/nto-school/proekt-novoy-sredy-zhizni/inzhenernye-biologicheskie-sistemy-agrobiotekhnologii",
  },
  [
    { date: new Date("2026-04-18") },
    { date: new Date("2025-04-19") },
    // { date: new Date("2024-04-13") },
  ],
);

const ntofinengEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntofineng",
    name: "НТО: программная инженерия в финансовых технологиях",
    url: "https://ntcontest.ru/tracks/nto-school/proekt-novoy-bezopasnosti/financial-engineering",
  },
  [
    {
      date: new Date("2026-04-18"),
      rcsoTrack: "программная инженерия в финансовых технологиях",
    },
    { date: new Date("2025-04-19") },
    { date: new Date("2024-04-13") },
  ],
);

const ntoflyEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntofly",
    name: "НТО: летающая робототехника",
    url: "https://ntcontest.ru/tracks/nto-school/proekt-novogo-transporta/letayushchaya-robototekhnika",
  },
  [
    // {
    //   date: new Date("2026-04-18"),
    //   rcsoTrack: "беспилотный транспорт: аэрокосмические системы, беспилотные авиационные системы, водные робототехнические системы, летающая робототехника",
    // },
    // {
    //   date: new Date("2025-04-19"),
    //   rcsoTrack: "летающая робототехника",
    // },
    // { date: new Date("2024-04-13") },
  ],
);

const ntofmeEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntofme",
    name: "НТО: гибкая и молекулярная электроника",
    url: "https://ntcontest.ru/tracks/nto-school/proekt-novogo-proizvodstva/flexible-electronics",
  },
  [
    // { date: new Date("2026-04-18") },
  ],
);

const ntofoodEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntofood",
    name: "НТО: современная пищевая инженерия",
    url: "https://ntcontest.ru",
  },
  [
    { date: new Date("2025-04-19") },
    // { date: new Date("2024-04-13") },
  ],
);

const ntogameEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntogame",
    name: "НТО: разработка компьютерных игр",
    url: "https://ntcontest.ru/tracks/nto-school/proekt-sozdaniya-virtualnykh-mirov/razrabotka-komputernih-igr",
  },
  [
    {
      date: new Date("2026-04-18"),
      rcsoTrack:
        "виртуальные миры: разработка компьютерных игр, технологии виртуальной реальности, технологии дополненной реальности, цифровые технологии в архитектуре",
    },
    {
      date: new Date("2025-04-19"),
      rcsoTrack:
        "виртуальные миры: разработка компьютерных игр, технологии виртуальной реальности, технологии дополненной реальности",
    },
    // { date: new Date("2024-04-13") },
  ],
);

const ntogeEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntoge",
    name: "НТО: геномное редактирование",
    rcsoTrack: "геномное редактирование",
    url: "https://ntcontest.ru/tracks/nto-school/proekt-novoy-meditsiny/genomnoe-redaktirovanie",
  },
  [
    { date: new Date("2026-04-18") },
    // { date: new Date("2025-04-19") },
    // { date: new Date("2024-04-13") },
  ],
);

const ntogeoEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntogeo",
    name: "НТО: анализ космических снимков и геопространственных данных",
    url: "https://ntcontest.ru/tracks/nto-school/kosmicheskiy-proekt/analiz-kosmicheskikh-snimkov-i-geoprostranstvennykh-dannykh",
  },
  [
    {
      date: new Date("2026-04-18"),
      rcsoTrack:
        "космические системы: анализ космических снимков и геопространственных данных, спутниковые системы",
    },
    {
      date: new Date("2025-04-19"),
      rcsoTrack: "анализ космических снимков и геопространственных данных",
    },
    { date: new Date("2024-04-13") },
  ],
);

const ntohydrEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntohydr",
    name: "НТО: цифровая гидрометеорология",
    url: "https://ntcontest.ru",
  },
  [
    // { date: new Date("2024-04-13") },
  ],
);

const ntoichEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntoich",
    name: "НТО: инфохимия",
    url: "https://ntcontest.ru/tracks/nto-school/proekt-po-iskusstvennomu-intellektu/infokhimiya",
  },
  [
    // {
    //   date: new Date("2026-04-18"),
    //   rcsoTrack: "инфохимия",
    // },
    { date: new Date("2025-04-19") },
    { date: new Date("2024-04-13") },
  ],
);

const ntoiesEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntoies",
    name: "НТО: интеллектуальные энергетические системы",
    rcsoTrack: "интеллектуальные энергетические системы",
    url: "https://ntcontest.ru/tracks/nto-school/energeticheskiy-proekt/intellektualnye-energeticheskie-sistemy",
  },
  [
    // { date: new Date("2026-04-18") },
    // { date: new Date("2025-04-19") },
    // { date: new Date("2024-04-13") },
  ],
);

const ntoirsEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntoirs",
    name: "НТО: интеллектуальные робототехнические системы",
    rcsoTrack: "интеллектуальные робототехнические системы",
    url: "https://ntcontest.ru/tracks/nto-school/proekt-novogo-proizvodstva/intellektualnye-robototekhnicheskie-sistemy",
  },
  [
    { date: new Date("2026-04-18") },
    { date: new Date("2025-04-19") },
    { date: new Date("2024-04-13") },
  ],
);

const ntomakerEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntomaker",
    name: "НТО: технологическое мейкерство",
    url: "https://ntcontest.ru",
  },
  [{ date: new Date("2024-04-13") }],
);

const ntomatEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntomat",
    name: "НТО: новые материалы",
    url: "https://ntcontest.ru",
  },
  [
    // { date: new Date("2025-04-19") },
    // { date: new Date("2024-04-13") },
  ],
);

const ntomediaEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntomedia",
    name: "НТО: научная медиакоммуникация",
    url: "https://ntcontest.ru",
  },
  [
    // { date: new Date("2024-04-13") },
  ],
);

const ntomobEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntomob",
    name: "НТО: разработка мобильных приложений",
    url: "https://ntcontest.ru/tracks/nto-school/proekt-sozdaniya-virtualnykh-mirov/mobile-apps-dev",
  },
  [
    {
      date: new Date("2026-04-18"),
      rcsoTrack: "разработка мобильных приложений",
    },
    { date: new Date("2025-04-19") },
  ],
);

const ntoncogEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntoncog",
    name: "НТО: нейротехнологии и когнитивные науки",
    rcsoTrack: "нейротехнологии и когнитивные науки",
    url: "https://ntcontest.ru/tracks/nto-school/proekt-po-neyrotekhnologiyam-i-kognitivnym-naukam/neyrotekhnologii-i-kognitivnye-nauki",
  },
  [
    { date: new Date("2026-04-18") },
    // { date: new Date("2025-04-19") },
    // { date: new Date("2024-04-13") },
  ],
);

const ntonuclEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntonucl",
    name: "НТО: ядерные технологии",
    rcsoTrack: "ядерные технологии",
    url: "https://ntcontest.ru/tracks/nto-school/energeticheskiy-proekt/yadernye-tekhnologii",
  },
  [
    // { date: new Date("2026-04-18") },
    { date: new Date("2025-04-19") },
    { date: new Date("2024-04-13") },
  ],
);

const ntooilEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntooil",
    name: "НТО: цифровое месторождение",
    url: "https://ntcontest.ru",
  },
  [
    // { date: new Date("2024-04-13") },
  ],
);

const ntophotEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntophot",
    name: "НТО: фотоника",
    rcsoTrack: "фотоника",
    url: "https://ntcontest.ru",
  },
  [{ date: new Date("2024-04-13") }],
);

const ntoqengEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntoqeng",
    name: "НТО: квантовый инжиниринг",
    url: "https://ntcontest.ru/tracks/nto-school/energeticheskiy-proekt/kvant-ingineering",
  },
  [
    {
      date: new Date("2026-04-18"),
      rcsoTrack: "квантовый инжиниринг",
    },
    { date: new Date("2025-04-19") },
    // { date: new Date("2024-04-13") },
  ],
);

const ntosatEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntosat",
    name: "НТО: спутниковые системы",
    url: "https://ntcontest.ru/tracks/nto-school/kosmicheskiy-proekt/sputnikovye-sistemy",
  },
  [
    {
      date: new Date("2026-04-18"),
      rcsoTrack:
        "космические системы: анализ космических снимков и геопространственных данных, спутниковые системы",
    },
    {
      date: new Date("2025-04-19"),
      rcsoTrack: "спутниковые системы",
    },
    // { date: new Date("2024-04-13") },
  ],
);

const ntosensEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntosens",
    name: "НТО: цифровые сенсорные системы",
    url: "https://ntcontest.ru/tracks/nto-school/proekt-novogo-proizvodstva/tsifrovye-sensornye-sistemy",
  },
  [
    {
      date: new Date("2026-04-18"),
      rcsoTrack:
        "умные системы и технологии: умный город, цифровые сенсорные системы",
    },
    { date: new Date("2025-04-19") },
    { date: new Date("2024-04-13") },
  ],
);

const ntourbEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntourb",
    name: "НТО: урбанистика",
    url: "https://ntcontest.ru/tracks/nto-school/proekt-novoy-sredy-zhizni/urbanistika",
  },
  [
    // { date: new Date("2026-04-18") },
    { date: new Date("2025-04-19") },
    // { date: new Date("2024-04-13") },
  ],
);

const ntovrEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntovr",
    name: "НТО: технологии виртуальной реальности",
    url: "https://ntcontest.ru/tracks/nto-school/proekt-sozdaniya-virtualnykh-mirov/vr",
  },
  [
    // {
    //   date: new Date("2026-04-18"),
    //   rcsoTrack: "виртуальные миры: разработка компьютерных игр, технологии виртуальной реальности, технологии дополненной реальности, цифровые технологии в архитектуре",
    // },
    // {
    //   date: new Date("2025-04-19"),
    //   rcsoTrack: "виртуальные миры: разработка компьютерных игр, технологии виртуальной реальности, технологии дополненной реальности",
    // },
    // { date: new Date("2024-04-13") },
  ],
);

const ntowrlsEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntowrls",
    name: "НТО: технологии беспроводной связи",
    rcsoTrack: "технологии беспроводной связи",
    url: "https://ntcontest.ru/tracks/nto-school/proekt-novoy-bezopasnosti/tekhnologii-besprovodnoy-svyazi",
  },
  [
    { date: new Date("2026-04-18") },
    // { date: new Date("2025-04-19") },
    // { date: new Date("2024-04-13") },
  ],
);

const ntowrsEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "ntowrs",
    name: "НТО: водные робототехнические системы",
    url: "https://ntcontest.ru/tracks/nto-school/proekt-novogo-proizvodstva/vodnye-robototekhnicheskie-sistemy",
  },
  [
    {
      date: new Date("2026-04-18"),
      rcsoTrack:
        "беспилотный транспорт: аэрокосмические системы, беспилотные авиационные системы, водные робототехнические системы, летающая робототехника",
    },
    {
      date: new Date("2025-04-19"),
      rcsoTrack: "водные робототехнические системы",
    },
    { date: new Date("2024-04-13") },
  ],
);

const ntoEvents: EventMeta[] = [
  ...ntoaeroEvents,
  ...ntoaiEvents,
  ...ntoamtEvents,
  ...ntoarEvents,
  ...ntoarchEvents,
  ...ntoatsEvents,
  ...ntoaviaEvents,
  ...ntobdmlEvents,
  ...ntobioEvents,
  ...ntobizEvents,
  ...ntobpaEvents,
  ...ntobsecEvents,
  ...ntochemEvents,
  ...ntocityEvents,
  ...ntocitynetEvents,
  ...ntocsEvents,
  ...ntocvdsEvents,
  ...ntodconEvents,
  ...ntodmmeEvents,
  ...ntoengbioEvents,
  ...ntofinengEvents,
  ...ntoflyEvents,
  ...ntofmeEvents,
  ...ntofoodEvents,
  ...ntogameEvents,
  ...ntogeEvents,
  ...ntogeoEvents,
  ...ntohydrEvents,
  ...ntoichEvents,
  ...ntoiesEvents,
  ...ntoirsEvents,
  ...ntomakerEvents,
  ...ntomatEvents,
  ...ntomediaEvents,
  ...ntomobEvents,
  ...ntoncogEvents,
  ...ntonuclEvents,
  ...ntooilEvents,
  ...ntophotEvents,
  ...ntoqengEvents,
  ...ntosatEvents,
  ...ntosensEvents,
  ...ntourbEvents,
  ...ntovrEvents,
  ...ntowrlsEvents,
  ...ntowrsEvents,
];

export default ntoEvents;
