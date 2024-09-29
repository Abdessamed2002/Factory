//File path: src/app/api/route.js
import { NextResponse } from "next/server";

//Handling POST request
export async function POST(req, res) {
    //Get the Form Data
    const Formdata = await req.formData();
    const name = Formdata.get('name');
    const point = Number(Formdata.get('point'));
    const startDate = Formdata.get('startDate');
    const endDate = Formdata.get('endDate');
    const type = Formdata.get('type');
    const repeat = Formdata.get('repeat') === "TRUE" ? true : false;
    const captionText = Formdata.get('captionText');
    //Response 
    const data = {
        name,
        point,
        startDate,
        endDate,
        type,
        repeat,
        captionText
    }
    fetchNumberTasks(data)

    return NextResponse.json({ name, point, startDate, endDate, type, repeat, captionText })
}

async function fetchNumberTasks(data) {
    const response = await fetch(`http://localhost:3001/tasks?key=${process.env.NEXT_PUBLIC_API_KEY}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
}
