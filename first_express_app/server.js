import express from "express";

const app = express();

app.use(express.json());

// Temporary in-memory product storage
const Products = [];

// Homepage
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to Products API!",
        endpoints: [
            "GET /products",
            "POST /products",
            "GET /products/:id",
            "PUT /products/:id",
            "DELETE /products/:id"
        ]
    });
});

// Create product
app.post("/products", (req, res) => {
    const newProduct = req.body;

    if (!newProduct.id || !newProduct.name || newProduct.price === undefined) {
        return res.status(400).json({
            message: "Please provide id, name and price"
        });
    }

    const existingProduct = Products.find(
        (product) => product.id === Number(newProduct.id)
    );

    if (existingProduct) {
        return res.status(409).json({
            message: "Product ID already exists"
        });
    }

    const product = {
        ...newProduct,
        id: Number(newProduct.id)
    };

    Products.push(product);

    res.status(201).json({
        message: "Product created successfully",
        data: product
    });
});

// Get all products
app.get("/products", (req, res) => {
    res.status(200).json({
        message: "All products fetched successfully",
        data: Products
    });
});

// Get product by ID
app.get("/products/:id", (req, res) => {
    const productId = Number(req.params.id);

    const product = Products.find(
        (item) => item.id === productId
    );

    if (!product) {
        return res.status(404).json({
            message: "Product not found"
        });
    }

    res.status(200).json({
        message: "Product details fetched successfully",
        data: product
    });
});

// Update product
app.put("/products/:id", (req, res) => {
    const productId = Number(req.params.id);

    const productIndex = Products.findIndex(
        (item) => item.id === productId
    );

    if (productIndex === -1) {
        return res.status(404).json({
            message: "Product not found"
        });
    }

    Products[productIndex] = {
        ...Products[productIndex],
        ...req.body,
        id: productId
    };

    res.status(200).json({
        message: "Product updated successfully",
        data: Products[productIndex]
    });
});

// Delete product
app.delete("/products/:id", (req, res) => {
    const productId = Number(req.params.id);

    const productIndex = Products.findIndex(
        (item) => item.id === productId
    );

    if (productIndex === -1) {
        return res.status(404).json({
            message: "Product not found"
        });
    }

    const deletedProduct = Products.splice(productIndex, 1);

    res.status(200).json({
        message: "Product deleted successfully",
        data: deletedProduct[0]
    });
});

// Local development server
if (process.env.VERCEL !== "1") {
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

// Export Express app for Vercel
export default app;
