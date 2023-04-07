interface RouteProps {
  route: any;
  onViewRoute: () => void;
  onStartRoute: () => void;
  onDeleteRoute: () => void;
}

export function RouteCard({
  route,
  onViewRoute,
  onStartRoute,
  onDeleteRoute,
}: RouteProps) {
  return (
    <div
      className={` rounded-lg p-2 mb-5 ${
        route.alert ? 'bg-red-500 text-white' : 'bg-slate-100'
      }`}
      key={route.id}
    >
      <h2 className="font-semibold">
        {route.alert ? 'ALERT' : null}
        {route.started && !route.walking && !route.alert
          ? 'Waiting for Buddy'
          : null}
        {route.walking && !route.alert ? 'En Route' : null}
        {!route.started && !route.alert && !route.walking ? 'New Route' : null}
      </h2>
      <div className="grid grid-cols-5 gap-1 p-[2px]">
        <div className={route.alert ? 'col-span-3' : 'col-span-2'}>
          <h1 className="text-lg font-medium">{route.displayName}</h1>
          <p className="text-sm text-ellipsis overflow-hidden">
            {route.alert
              ? `CURR LOC: ${route.currentLocName}`
              : route.originName}
          </p>
        </div>

        <button
          className="border border-slate-200 rounded-lg p-2 w-full col-span-1 text-center"
          onClick={onViewRoute}
        >
          View Route
        </button>
        {!route.alert ? (
          <button
            className={`border border-slate-200 rounded-lg p-2 h-full w-full col-span-1 text-center ${
              route.alert ? 'bg-red-500 text-white' : 'bg-slate-100'
            }`}
            onClick={onStartRoute}
          >
            Start Route
          </button>
        ) : null}

        <button
          className={`border border-slate-200 rounded-lg p-2 h-full w-full col-span-1 text-center ${
            route.alert ? 'bg-red-500 text-white' : 'bg-slate-100'
          }`}
          onClick={onDeleteRoute}
        >
          Delete Route
        </button>
      </div>
    </div>
  );
}
