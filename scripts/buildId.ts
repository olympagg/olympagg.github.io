import path from "path";

const BUNDLE_PATH = path.resolve(
  import.meta.dir,
  "..",
  "src",
  "data",
  "eventBundle.json",
);

export const resolveCommitHash = (): string => {
  const fromEnv = process.env.GITHUB_SHA ?? "";
  if (fromEnv) {
    return fromEnv.slice(0, 7);
  }

  const git = Bun.spawnSync(["git", "rev-parse", "--short=7", "HEAD"]);
  if (git.exitCode === 0) {
    return git.stdout.toString().trim();
  }

  return "unknown";
};

const formatUtcTimestamp = (date: Date): string =>
  date
    .toISOString()
    .replace(/\.\d+Z$/, "Z")
    .replaceAll(/[-:]/g, "");

const resolveBundleHash = async (): Promise<string> => {
  const file = Bun.file(BUNDLE_PATH);
  if (!(await file.exists())) {
    return "nobundle";
  }

  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(await file.arrayBuffer());
  return hasher.digest("hex").slice(0, 8);
};

export const resolveBuildId = async (): Promise<string> =>
  `${formatUtcTimestamp(new Date())}${await resolveBundleHash()}`;

if (import.meta.main) {
  console.log(await resolveBuildId());
}
