import ShowCeramic from "../components/ShowCeramic";
import ShowMaterial from "../components/ShowMaterial";
import ShowTypes from "../components/ShowTypes";

const ViewAll = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-base-300 pb-4">
        <h1 className="text-2xl font-semibold">Browse All</h1>
        <p className="text-sm text-base-content/60 mt-1">
          Materials, typologies, and ceramic colour codes at a glance.
        </p>
        <div className="h-0.5 w-8 bg-primary rounded-full mt-3"></div>
      </div>
      <div className="flex justify-around">
        <ShowMaterial />
        <ShowTypes />
        <ShowCeramic />
      </div>
    </div>
  );
};

export default ViewAll;
