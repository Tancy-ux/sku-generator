import ShowCeramic from "../components/ShowCeramic";
import ShowMaterial from "../components/ShowMaterial";
import ShowProducts from "../components/ShowProducts";
import ShowTypes from "../components/ShowTypes";

const ViewAll = () => {
  return (
    <div className="flex justify-around">
      <ShowMaterial />
      <div>
        <ShowTypes />
        <ShowProducts />
      </div>
      <ShowCeramic />
    </div>
  );
};

export default ViewAll;
