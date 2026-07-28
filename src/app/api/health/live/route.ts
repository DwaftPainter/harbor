export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    {
      service: "harbor",
      status: "ok",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
