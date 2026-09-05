import { EmptyState } from "@/components/app/EmptyState";
import { RideCard } from "@/components/app/RideCard";
import { getRiderRides } from "@/lib/api/rides";
import { requireRider } from "@/lib/api/guards";

export default async function RiderTripsPage() {
  const principal = await requireRider("/app/rides");
  const rides = await getRiderRides(principal.id);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-text">Trips</h1>
      {rides.length > 0 ? (
        <>
          <p className="mt-1 text-[15px] text-text-muted">
            {rides.length} trip{rides.length === 1 ? "" : "s"}.
          </p>
          <div className="mt-5 grid gap-2.5">
            {rides.map((r) => (
              <RideCard key={r.id} ride={r} href={`/app/rides/${r.id}`} />
            ))}
          </div>
        </>
      ) : (
        <div className="mt-6">
          <EmptyState
            title="No trips yet"
            body="Your rides will show up here."
            action={{ href: "/app", label: "Book a ride" }}
          />
        </div>
      )}
    </div>
  );
}
