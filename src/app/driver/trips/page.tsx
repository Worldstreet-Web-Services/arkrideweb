import { EmptyState } from "@/components/app/EmptyState";
import { RideCard } from "@/components/app/RideCard";
import { getDriverRides } from "@/lib/api/rides";
import { requireDriver } from "@/lib/api/guards";

export default async function DriverTripsPage() {
  const principal = await requireDriver("/driver/trips");
  const rides = await getDriverRides(principal.id);

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
              <RideCard key={r.id} ride={r} href={`/driver/trips/${r.id}`} />
            ))}
          </div>
        </>
      ) : (
        <div className="mt-6">
          <EmptyState
            title="No trips yet"
            body="Go online and accepted rides will appear here."
            action={{ href: "/driver", label: "Go to console" }}
          />
        </div>
      )}
    </div>
  );
}
