import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col justify-center text-center flex-1">
      <h1 className="text-2xl font-bold mb-4">
        Next Level Web Development Notes
      </h1>
      <Link href="/docs" className="font-medium underline">
        View notes
      </Link>
      <div className="mt-12">
        <p>
          Don't forget to use{" "}
          <a className="underline" href="https://esyt.eshayat.com">
            esyt
          </a>{" "}
          btw :)
        </p>
        <div>
          <img
            src="esyt.gif"
            alt="ESYT demo"
            className="w-full max-w-3xl mt-8 mx-auto rounded-lg overflow-hidden border border-fd-border shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}
