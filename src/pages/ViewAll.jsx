import ShowCeramic from "../components/ShowCeramic";
import ShowMaterial from "../components/ShowMaterial";
import ShowProducts from "../components/ShowProducts";
import ShowTypes from "../components/ShowTypes";

const ViewAll = () => {
  return (
    <div className="flex justify-around">
      <ShowMaterial />
      <ShowTypes />
      <ShowCeramic />
      <ShowProducts />
    </div>
  );
};

export default ViewAll;
