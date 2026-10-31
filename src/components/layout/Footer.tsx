export default function Footer() {
  return (
    <footer className="bg-green-900 text-green-100 text-sm mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
        <p className="m-0 font-medium">
          ⚠️ Las reglas de reciclaje varían según el municipio en Colombia.
        </p>
        <p className="m-0 text-green-300">
          © {new Date().getFullYear()} EcoGuía — Educación ambiental para Colombia
        </p>
      </div>
    </footer>
  )
}
