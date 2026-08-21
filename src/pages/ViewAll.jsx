import ShowTypes from "../components/ShowTypes";

const ViewAll = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-base-300 pb-4">
        <h1 className="text-2xl font-semibold">Browse All</h1>
        <p className="text-sm text-base-content/60 mt-1">
          Typologies at a glance — materials and ceramic colours live on
          their own Add pages.
        </p>
        <div className="h-0.5 w-8 bg-primary rounded-full mt-3"></div>
      </div>
      <div className="bg-base-100 border border-base-300 rounded-box p-6 max-w-2xl">
        <ShowTypes />
      </div>
    </div>
  );
};

export default ViewAll;
