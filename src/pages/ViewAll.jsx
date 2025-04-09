import ShowCeramic from "../components/ShowCeramic";
import ShowMaterial from "../components/ShowMaterial";
import ShowProducts from "../components/ShowProducts";
import ShowTypes from "../components/ShowTypes";

const ViewAll = () => {
  return (
    <div className="flex overflow-x-auto py-4 gap-4">
      <ShowMaterial />
      <ShowTypes />
      <ShowCeramic />
      <ShowProducts />
    </div>
  );
};

export default ViewAll;
