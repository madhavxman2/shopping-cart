import React, { useEffect, useState } from "react";
import MyContext from "./myContext";
import { QuerySnapshot, Timestamp, addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { fireDB } from "../../firebase/firebaseConfig";

function MyState(props) {
  const [mode, setMode] = useState("light");
  const toggleMode = () => {
    if (mode === "light") {
      setMode("dark");
      document.body.style.backgroundColor = "rgb(17, 24, 39)";
    } else {
      setMode("light");
      document.body.style.backgroundColor = "white";
    }
  };
  const [loading, setLoading] = useState(false);

  const [products, setProducts] = useState({
    title: null,
    price: null,
    imageUrl: null,
    category: null,
    description: null,
    time: Timestamp.now(),
    date: new Date().toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
  });
 // ********************** Add Product Section  **********************
  const addProduct = async () => {
    if (
      products.title === null ||
      products.price === null ||
      products.imageUrl === null ||
      products.category === null ||
      products.description === null
    ) {
      return toast.error("all fields are required");
    }
    setLoading(true);
    try {
      const productRef = collection(fireDB, "products");

      await addDoc(productRef, products);
      toast.success("Add product successfully");
      setTimeout(()=>{
        window.location.href='/dashboard'
      },800);
      getProductData();
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  //  *** get product
  const [product,setProduct]=useState([]);

 const getProductData=async ()=>{
  setLoading(true);
  try {
    const q=query(
      collection(fireDB,'products'),
      orderBy('time')
    );

    const data = onSnapshot(q,(QuerySnapshot)=>{
      let productArray=[];
      QuerySnapshot.forEach((doc)=>{
        productArray.push({...doc.data(),id:data.id});
      });
      setProduct(productArray);
      setLoading(false);
    });
    return ()=>data;  
  } catch (error) {
    console.log(error);
    setLoading(false);
  }
 }

useEffect(()=>{
  getProductData();
},[]);
 
// update product function
const editHandle = (item) => {
  setProducts(item)
}
// update product
const updateProduct = async (item) => {
  setLoading(true)
  try {
    await setDoc(doc(fireDb, "products", products.id), products);
    toast.success("Product Updated successfully")
    getProductData();
    setLoading(false)
    window.location.href = '/dashboard'
  } catch (error) {
    setLoading(false)
    console.log(error)
  }
  setProducts("")
}

const deleteProduct = async (item) => {

  try {
    setLoading(true)
    await deleteDoc(doc(fireDb, "products", item.id));
    toast.success('Product Deleted successfully')
    console.log(deleteDoc(doc(fireDb, "products", item.id)))
    setLoading(false)
    getProductData();
  } catch (error) {
    // toast.success('Product Deleted Falied')
    setLoading(false)
  }
}


  return (
    <MyContext.Provider value={{ mode, toggleMode, loading, setLoading,products ,setProducts,addProduct,product ,editHandle,updateProduct,deleteProduct}}>
      {props.children}
    </MyContext.Provider>
  );
}

export default MyState;
