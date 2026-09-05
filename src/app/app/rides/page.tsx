import { RideCard } from "@/components/app/RideCard";
import { getRiderRides } from "@/lib/api/rides";
import { requireRider } from "@/lib/api/guards";

export default async function RiderTripsPage() {
  const principal = await requireRider("/app/rides");
  const rides = await getRiderRides(principal.id);

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-text">Trips</h1>
      <p className="mt-1 text-[15px] text-text-muted">
        {rides.length === 0
          ? "You haven't taken a trip yet."
          : `${rides.length} trip${rides.length === 1 ? "" : "s"}.`}
      </p>

      {rides.length > 0 && (
        <div className="mt-5 grid gap-2.5">
          {rides.map((r) => (
            <RideCard key={r.id} ride={r} href={`/app/rides/${r.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
