import { hashPassword } from "../lib/crm/password";

async function main() {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
  const password = Buffer.concat(chunks).toString("utf8").replace(/\r?\n$/, "");
  if (!password) {
    console.error("Paste a password on stdin. The hash is printed to stdout and is not stored.");
    process.exit(1);
  }
  const hash = await hashPassword(password);
  process.stdout.write(`${hash}\n`);
  console.error("Copy the hash into CRM_OWNER_PASSWORD_HASH. Do not commit the password or the hash.");
}

main().catch(() => {
  console.error("password hash failed");
  process.exit(1);
});
