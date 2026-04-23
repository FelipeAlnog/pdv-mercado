
export default function Loader() {
  return (
     <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <span className="ml-3">Carregando...</span>
        </div>
      </div>
  );
}