import { useUserStore } from "@/app/userStore/userStore";

const GetItem = () => {
  const { loginToSapB1, logoutToSapB1, setSearchTerm, search, Items } =
    useUserStore();

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
        <div className="flex gap-4">
          <button
            onClick={loginToSapB1}
            className="btn btn-primary btn-sm text-white"
          >
            Login
          </button>
          {/* <button
            onClick={logoutToSapB1}
            className="btn btn-primary btn-sm text-white"
          >
            Logout
          </button> */}
        </div>

        {/* Search Section */}
        <h1 className="text-3xl font-bold mb-4">Search Item</h1>
        <div className="w-full max-w-lg">
          <div className="form-control flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Item code"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {/* Search Button */}
            <button
              onClick={search}
              className="btn btn-primary w-full md:w-auto"
            >
              Search
            </button>
          </div>
        </div>

        {/* Display Results */}
        <div className="w-full mt-8">
          {Items && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 border rounded-md shadow-md">
                <span className="font-semibold">Item Code:</span>{" "}
                {Items.ItemCode}
              </div>
              <div className="p-4 border rounded-md shadow-md">
                <span className="font-semibold">Item Name:</span>{" "}
                {Items.ItemName}
              </div>
              <div className="p-4 border rounded-md shadow-md">
                <span className="font-semibold">Items Group Code:</span>{" "}
                {Items.ItemsGroupCode}
              </div>
              <div className="p-4 border rounded-md shadow-md">
                <span className="font-semibold">Sales VAT Group:</span>{" "}
                {Items.SalesVATGroup}
              </div>
              <div className="p-4 border rounded-md shadow-md">
                <span className="font-semibold">Item Type:</span>{" "}
                {Items.ItemType}
              </div>
              <div className="p-4 border rounded-md shadow-md">
                <span className="font-semibold">Update Date:</span>{" "}
                {Items.UpdateDate}
              </div>
              <div className="p-4 border rounded-md shadow-md">
                <span className="font-semibold">Update Time:</span>{" "}
                {Items.UpdateTime}
              </div>
              <div className="p-4 border rounded-md shadow-md">
                <span className="font-semibold">Items Group:</span>{" "}
                {Items.U_APP_ItemSGroup}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GetItem;
