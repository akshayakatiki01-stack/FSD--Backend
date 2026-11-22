import express from "express";
const app=express();
//middleware
app.use(express.json());
const Products=[];
//create a new product-POST http://localhost:5000/Products playload:{id:1,name:"laptop",price:50000}
app.post("/Products ",(req,res)=>{
    const newProduct=req.body;
    Products.push(newProduct);
    res.status(200).json({message: "Product created Successfully ",data:newProduct});
});
//read all products-GET http://localhost:5000/Products
app.get("/Products ",(req,res)=>{
    res.status(200).json({message:"All Products fetched Successfully",data:Products});
});
//read a product by ID - GET http://localhost:5000/Products/:id
app.get("/Products/:id",(req,res)=>{
    const ProductId=parseInt(req.params.id);
    const Product=Products.find((prod)=>prod.id===ProductId);
    if(Product){
        res.status(200).json({message:"Product details fetched Successfully ",data:Product});
    }else{
        res.status(404).json({message:"Product not found"});
    }
});
//Update a product by ID - PUT http://localhost:5000/Products/:id playload:{id:1,name:"laptop,price:60000"}
app.put("/product/:id",(req,res)=>{
    const ProductId=parseInt(req.params.id);
    const updateData=req.body;
    const productIndex=Products.findIndex((prod)=>prod.id===ProductId);
    if(productIndex!==-1){
        Products[productIndex]={...Products[productIndex],...updateData};
        res.status(200).json({message:"product updated successfully",data:Products[productIndex]});
    }else{
        response.status(404).json({message:"product not found"});
    }
});
//delete a product by ID - DELETE http://localhost:5000/Products/:id
app.delete("/products/:id",(req,res)=>{
    const ProductId=parseInt(req.params.id);
    const productIndex=Products.findIndex((prod)=>prod.id===ProductId);
    if(productIndex!==-1){
        const delteProducts=Products.splice(productIndex,1);
        res.status(200).json({message:"Product deleted Succcessfully ",data:delteProducts[0]});
    }else{
        res.status(404).json({message:"Product not found"});
    }
});
export default app;

