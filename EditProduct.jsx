import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import productvalidation from "../validations/productvalidation";
import { BASE_URL } from "../constants/constants";

function EditProduct() {
  const sellerid = localStorage.getItem("userid");
  const { prodid } = useParams();
  const [product, setProduct] = useState({
    pname: "",
    pcat: "",
    price: "",
    qty: "",
    descr: "",
    sellerId: sellerid,
    photo: null,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photo, setphoto] = useState();
  const [submitted, setSubmitted] = useState(false);
  const history = useNavigate();
  const [cats, setCats] = useState([]);
  const [isFileValid, setIsFileValid] = useState(true);
  const [fileSizeError, setFileSizeError] = useState(""); // New state for file size errors
  const [fileTypeError, setFileTypeError] = useState(""); // New state for file type errors

  useEffect(() => {
    axios.get(BASE_URL + "api/category").then((resp) => setCats(resp.data));
    axios.get(BASE_URL + "api/products/" + prodid).then((resp) => {
      setProduct({
        pname: resp.data.pname,
        pcat: resp.data.pcat,
        price: resp.data.price,
        qty: resp.data.qty,
        photo: resp.data.photo,
        descr: resp.data.descr,
      });
      setphoto(BASE_URL + "images/" + resp.data.photo);
    });
  }, [prodid]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));

    const validationErrors = productvalidation({ ...product, [name]: value });
    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      if (!validationErrors[name]) {
        delete updatedErrors[name];
      }
      return updatedErrors;
    });
  };

  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));

    const validationErrors = productvalidation({ ...product, [name]: value });
    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      if (!validationErrors[name]) {
        delete updatedErrors[name];
      }
      return updatedErrors;
    });
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];

    if (file) {
      let hasError = false;

      // Clear previous errors
      setFileSizeError("");
      setFileTypeError("");

      // Check for file type
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        setFileTypeError("Only JPG, JPEG, and PNG files are allowed.");
        setIsFileValid(false);
        setErrors((prevErrors) => ({
          ...prevErrors,
          photo: "Only JPG, JPEG, and PNG files are allowed.",
        }));
        hasError = true;
      }

      // Check for file size if no file type error
      if (!hasError && file.size > 2 * 1024 * 1024) {
        // 2 MB in bytes
        setFileSizeError("File size must be less than 2 MB.");
        setIsFileValid(false);
        setErrors((prevErrors) => ({
          ...prevErrors,
          photo: "File size must be less than 2 MB.",
        }));
        hasError = true;
      }

      if (!hasError) {
        setSelectedPhoto(file);
        setphoto(URL.createObjectURL(file));
        setProduct((prev) => ({ ...prev, photo: file }));
        setIsFileValid(true);

        // Clear error for the file field if it's now valid
        const updatedErrors = { ...errors };
        delete updatedErrors.photo;
        setErrors(updatedErrors);
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const trimmedValue = value.trim().replace(/\s+/g, " ");

    setProduct((prev) => ({ ...prev, [name]: trimmedValue }));
    setTouched((prev) => ({ ...prev, [name]: true }));

    const validationError = productvalidation({
      ...product,
      [name]: trimmedValue,
    });
    setErrors((prevErrors) => ({ ...prevErrors, ...validationError }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const allFieldsTouched = {
      pname: true,
      pcat: true,
      price: true,
      qty: true,
      photo: true,
    };
    setTouched(allFieldsTouched);

    const validationErrors = productvalidation(product);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0 && isFileValid) {
      setSubmitted(true);
    } else {
      setSubmitted(false);
      alert(
        "Please ensure all fields are filled correctly and select a valid image file."
      );
    }
  };

  useEffect(() => {
    if (Object.keys(errors).length === 0 && submitted) {
      const formData = new FormData();
      formData.append("pic", selectedPhoto);
      formData.append("pname", product.pname);
      formData.append("price", product.price);
      formData.append("qty", product.qty);
      formData.append("pcat", product.pcat);
      formData.append("sellerId", sellerid);

      axios
        .put(BASE_URL + "api/products/" + prodid, formData)
        .then((resp) => {
          alert("Product saved successfully");
          history("/myproducts");
        })
        .catch((error) => {
          console.log("Error", error);
          alert("Error saving product");
        });
    }
  }, [errors, submitted, selectedPhoto, product, prodid, sellerid, history]);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-sm-3 offset-1">
          <img alt="Product" width="300" src={photo} />
        </div>

        <div className="col-sm-5">
          <div className="card shadow">
            <div className="card-body">
              <h4 className="text-center p-2">Edit Product</h4>
              <form onSubmit={handleSubmit}>
                <div className="form-group form-row">
                  <label className="col-sm-4 form-control-label">
                    <span style={{ color: "red" }}>*</span>Product Name
                  </label>
                  <div className="col-sm-8">
                    <input
                      type="text"
                      name="pname"
                      value={product.pname}
                      onChange={handleInput}
                      onBlur={handleBlur}
                      className={`form-control ${
                        touched.pname && errors.pname ? "is-invalid" : ""
                      }`}
                    />
                    <div className="error-container">
                      {touched.pname && errors.pname && (
                        <div className="text-danger float-left">
                          {errors.pname}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="form-group form-row">
                  <label className="col-sm-4 form-control-label">
                    <span style={{ color: "red" }}>*</span>Category
                  </label>
                  <div className="col-sm-8">
                    <select
                      name="pcat"
                      value={product.pcat}
                      onChange={handleCategoryChange}
                      onBlur={handleBlur}
                      className={`form-control ${
                        touched.pcat && errors.pcat
                          ? "is-invalid blur-arrow"
                          : ""
                      }`}
                    >
                      <option value="">Select Category</option>
                      {cats.map((x) => (
                        <option key={x.catid} value={x.catid}>
                          {x.catname}
                        </option>
                      ))}
                    </select>
                    <div className="error-container">
                      {touched.pcat && errors.pcat && (
                        <div className="text-danger float-left">
                          {errors.pcat}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="form-group form-row">
                  <label className="col-sm-4 form-control-label">
                    <span style={{ color: "red" }}>*</span>Price
                  </label>
                  <div className="col-sm-8">
                    <input
                      type="number"
                      name="price"
                      value={product.price}
                      onChange={handleInput}
                      onBlur={handleBlur}
                      min="1"
                      className={`form-control ${
                        touched.price && errors.price ? "is-invalid" : ""
                      }`}
                    />
                    <div className="error-container">
                      {touched.price && errors.price && (
                        <div className="text-danger float-left">
                          {errors.price}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="form-group form-row">
                  <label className="col-sm-4 form-control-label">
                    <span style={{ color: "red" }}>*</span>Quantity
                  </label>
                  <div className="col-sm-8">
                    <input
                      type="number"
                      name="qty"
                      min={1}
                      value={product.qty}
                      onChange={handleInput}
                      onBlur={handleBlur}
                      className={`form-control ${
                        touched.qty && errors.qty ? "is-invalid" : ""
                      }`}
                    />
                    <div className="error-container">
                      {touched.qty && errors.qty && (
                        <div className="text-danger float-left">
                          {errors.qty}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="form-group form-row">
                  <label className="col-sm-4 form-control-label">
                    Product Image
                  </label>
                  <div className="col-sm-8">
                    <input
                      type="file"
                      accept="image/*"
                      name="photo"
                      onChange={handleFileInput}
                      onBlur={handleBlur}
                      className={`form-control ${
                        fileSizeError || fileTypeError ? "is-invalid" : ""
                      }`}
                    />
                    <div className="error-container">
                      {fileSizeError && (
                        <div className="text-danger float-left">
                          {fileSizeError}
                        </div>
                      )}
                      {fileTypeError && (
                        <div className="text-danger float-left">
                          {fileTypeError}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button className="btn btn-primary btn-block">
                  Update Product
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProduct;
