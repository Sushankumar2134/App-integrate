import axios from "axios";
import baseURL,{endpoint} from "./apiclient";   


const apiclient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export async function fetchmodules() {
    try {
        const response = await apiclient.get(
  `${endpoint.modules}?platform=Both&access_for=institution`
);
        return response.data; // Assuming the API returns data in the 'data' field
    } catch (error) {
        console.error("Error fetching modules:", error);
        throw error;
    }
}
export async function createmodule(moduleData:any) {
    try {
        const response = await apiclient.post(endpoint.modules, moduleData);
        return response.data; // Assuming the API returns the created module in the 'data' field
    } catch (error) {
        console.error("Error creating module:", error);
        throw error;
    }
}
export async function fetchmoduleById(id: string) {
    try {
        const response = await apiclient.get(`${endpoint.modules}/${id}`);
        return response.data; // Assuming the API returns the module in the 'data' field
    } catch (error) {
        console.error("Error fetching module by ID:", error);
        throw error;
    }
}
export async function deleteModule(id: string) {
    try {
        const response = await apiclient.delete(`${endpoint.modules}/${id}`);
        return response.data; // Assuming the API returns a success message or the deleted module in the 'data' field
    } catch (error) {
        console.error("Error deleting module:", error);
        throw error;
    }}

    export async function updateModule(id: string, moduleData: any) {
        try {
            const response = await apiclient.put(`${endpoint.modules}/${id}`, moduleData);
            return response.data; // Assuming the API returns the updated module in the 'data' field
        } catch (error) {
            console.error("Error updating module:", error);
            throw error;
        }
    }
    export async function restoreModule(id: string) {
    try {
        const response = await apiclient.put(
            `${endpoint.modules}/${id}/restore`
        );

        return response.data;
    } catch (error) {
        console.log("Module restore error");
        return null;
    }
}

export async function forceDeleteModule(id: string) {
    try {
        const response = await apiclient.delete(
            `${endpoint.modules}/${id}/force-delete`
        );

        return response.data;
    } catch (error) {
        console.log("Module permanent delete error");
        return null;
    }
}