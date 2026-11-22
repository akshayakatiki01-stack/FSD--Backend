import express from "express";
import fs from "fs";

const app = express();

app.use(express.json());

// Homepage
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to First Persistent Express API!",
        endpoints: [
            "GET /api/v1/faculty",
            "POST /api/v1/faculty",
            "GET /api/v1/faculty/:id",
            "PUT /api/v1/faculty/:id",
            "DELETE /api/v1/faculty/:id"
        ]
    });
});

// Read data
const readData = () => {
    try {
        return JSON.parse(
            fs.readFileSync("./faculty.json", "utf-8")
        );
    } catch (error) {
        return [];
    }
};

// Write data
const writeData = (data) => {
    fs.writeFileSync(
        "./faculty.json",
        JSON.stringify(data, null, 2)
    );
};

// Create faculty
app.post("/api/v1/faculty", (req, res) => {
    const allFaculty = readData();

    const nextId = allFaculty.length === 0
        ? 1
        : allFaculty[allFaculty.length - 1].id + 1;

    const newFaculty = {
        id: nextId,
        ...req.body
    };

    allFaculty.push(newFaculty);
    writeData(allFaculty);

    res.status(201).json({
        message: "Faculty created successfully",
        data: newFaculty
    });
});

// Get all faculty
app.get("/api/v1/faculty", (req, res) => {
    const allFaculty = readData();
    const { department } = req.query;

    const faculty = department
        ? allFaculty.filter(fac => fac.department === department)
        : allFaculty;

    res.status(200).json({
        message: "Faculty retrieved successfully",
        data: faculty
    });
});

// Get faculty by ID
app.get("/api/v1/faculty/:id", (req, res) => {
    const facultyId = parseInt(req.params.id);
    const allFaculty = readData();

    const faculty = allFaculty.find(
        fac => fac.id === facultyId
    );

    if (!faculty) {
        return res.status(404).json({
            message: "Faculty not found"
        });
    }

    res.status(200).json({
        message: "Faculty retrieved successfully",
        data: faculty
    });
});

// Update faculty
app.put("/api/v1/faculty/:id", (req, res) => {
    const facultyId = parseInt(req.params.id);
    const allFaculty = readData();

    const facultyIndex = allFaculty.findIndex(
        fac => fac.id === facultyId
    );

    if (facultyIndex === -1) {
        return res.status(404).json({
            message: "Faculty not found"
        });
    }

    const updatedFaculty = {
        ...allFaculty[facultyIndex],
        ...req.body,
        id: facultyId
    };

    allFaculty[facultyIndex] = updatedFaculty;
    writeData(allFaculty);

    res.status(200).json({
        message: "Faculty updated successfully",
        data: updatedFaculty
    });
});

// Delete faculty
app.delete("/api/v1/faculty/:id", (req, res) => {
    const facultyId = parseInt(req.params.id);
    const allFaculty = readData();

    const facultyIndex = allFaculty.findIndex(
        fac => fac.id === facultyId
    );

    if (facultyIndex === -1) {
        return res.status(404).json({
            message: "Faculty not found"
        });
    }

    const deletedFaculty = allFaculty.splice(facultyIndex, 1)[0];
    writeData(allFaculty);

    res.status(200).json({
        message: "Faculty deleted successfully",
        data: deletedFaculty
    });
});

// Local development
if (process.env.VERCEL !== "1") {
    const PORT = process.env.PORT || 8080;

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

// Vercel export
export default app;
