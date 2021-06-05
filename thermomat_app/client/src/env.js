export default function getEnv(name) {
  return window?.config?.[name] || process.env[name];
}
