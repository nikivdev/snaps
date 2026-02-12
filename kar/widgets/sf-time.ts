const now = new Date().toLocaleTimeString("en-US", {
  timeZone: "America/Los_Angeles",
  hour: "numeric",
  minute: "2-digit",
});

const createdAt = Date.now();

console.log(
  JSON.stringify({
    title: "San Francisco",
    message: now,
    createdAt,
    expiresAt: createdAt + 1000,
    action: { type: "copy", value: now, label: "Copy" },
  }),
);
