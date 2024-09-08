import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import productvalidation from "../validations/productvalidation";
import { BASE_URL } from "../constants/constants";

function AddProduct() {
  const sellerid = localStorage.getItem("userid");

  const [product, setProduct] = useState({
    pname: "",
    pcat: "",
    price: "",
    descr: "",
    qty: 1,
    sellerId: sellerid,
    photo: null,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isFileValid, setIsFileValid] = useState(true); // Track file validity
  const [fileSizeError, setFileSizeError] = useState(""); // Track file size error
  const [fileTypeError, setFileTypeError] = useState(""); // Track file type error
  const navigate = useNavigate();
  const [cats, setCats] = useState([]);

  useEffect(() => {
    axios.get(BASE_URL + "api/category").then((resp) => setCats(resp.data));
  }, []);

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
      // Check for file type
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        setFileTypeError("Only JPG, JPEG, and PNG files are allowed.");
        setIsFileValid(false);
        setErrors((prevErrors) => ({
          ...prevErrors,
          photo: "Only JPG, JPEG, and PNG files are allowed.",
        }));
        return;
      }

      // Check for file size
      if (file.size > 2 * 1024 * 1024) {
        // 2 MB limit
        setFileSizeError("File size exceeds 2 MB.");
        setIsFileValid(false);
        setErrors((prevErrors) => ({
          ...prevErrors,
          photo: "File size exceeds 2 MB",
        }));
        return;
      }

      setSelectedPhoto(file);
      setProduct((prev) => ({ ...prev, photo: file }));
      setIsFileValid(true); // File is valid
      setFileSizeError(""); // Clear file size error
      setFileTypeError(""); // Clear file type error
      setErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        delete updatedErrors.photo; // Clear previous photo errors if file is valid
        return updatedErrors;
      });
    } else {
      setIsFileValid(false);
      setFileSizeError(""); // Clear file size error
      setFileTypeError(""); // Clear file type error
      setErrors((prevErrors) => ({
        ...prevErrors,
        photo: "Image is required",
      }));
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
      photo: true, // Ensure photo field is marked as touched
    };
    setTouched(allFieldsTouched);

    const validationErrors = productvalidation(product);
    setErrors(validationErrors);

    // Check if file is valid and ensure validation errors are included
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
        .post(BASE_URL + "api/products", formData)
        .then((resp) => {
          alert("Product saved successfully");
          navigate("/myproducts");
        })
        .catch((error) => {
          console.log("Error", error);
          alert("Error saving product");
        });
    }
  }, [
    errors,
    navigate,
    product.pcat,
    product.pname,
    product.price,
    product.qty,
    selectedPhoto,
    sellerid,
    submitted,
  ]);

  return (
    <div className="container">
      <div className="card shadow">
        <div className="card-body">
          <div className="row">
            <div className="col-sm-6 mx-auto">
              <h4 className="text-center p-2">Add Product Form</h4>
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
                        touched.pname && !product.pname ? "is-invalid" : ""
                      }`}
                    />
                    <div className="error-container">
                      {touched.pname && errors.pname && (
                        <small className="text-danger float-right">
                          {errors.pname}
                        </small>
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
                        touched.pcat && !product.pcat ? "is-invalid" : ""
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
                        <small className="text-danger float-right">
                          {errors.pcat}
                        </small>
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
                        touched.price && !product.price ? "is-invalid" : ""
                      }`}
                    />
                    <div className="error-container">
                      {touched.price && errors.price && (
                        <small className="text-danger float-right">
                          {errors.price}
                        </small>
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
                        touched.qty && !product.qty ? "is-invalid" : ""
                      }`}
                    />
                    <div className="error-container">
                      {touched.qty && errors.qty && (
                        <small className="text-danger float-right">
                          {errors.qty}
                        </small>
                      )}
                    </div>
                  </div>
                </div>
                <div className="form-group form-row">
                  <label className="col-sm-4 form-control-label">
                    <span style={{ color: "red" }}>*</span>Image
                  </label>
                  <div className="col-sm-8">
                    <input
                      type="file"
                      name="photo"
                      accept="image/*"
                      onChange={handleFileInput}
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, photo: true }))
                      }
                      className={`form-control ${
                        touched.photo &&
                        (errors.photo || fileSizeError || fileTypeError)
                          ? "is-invalid"
                          : ""
                      }`}
                    />
                    <div className="error-container">
                      {touched.photo &&
                        (errors.photo || fileSizeError || fileTypeError) && (
                          <small className="text-danger float-right">
                            {errors.photo || fileSizeError || fileTypeError}
                          </small>
                        )}
                    </div>
                  </div>
                </div>
                <div className="form-group form-row">
                  <div className="col-sm-8 offset-sm-4">
                    <button type="submit" className="btn btn-primary btn-block">
                      Save
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddProduct;
