import AddMaterial from "../components/AddMaterial";
import ShowMaterial from "../components/ShowMaterial";

const AddMaterials = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-base-300 pb-4">
        <h1 className="text-2xl font-semibold">Add Materials</h1>
        <p className="text-sm text-base-content/60 mt-1">
          Register a new material and its abbreviation.
        </p>
        <div className="h-0.5 w-8 bg-primary rounded-full mt-3"></div>
      </div>
      <AddMaterial />
      <ShowMaterial />
    </div>
  );
};

export default AddMaterials;
