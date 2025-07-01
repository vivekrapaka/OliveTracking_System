import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useAllProjects = () => {
  return useQuery({
    queryKey: ["allProjects"],
    queryFn: async () => {
      const response = await axios.get("/api/projects");
      return response.data.projects;
    },
    enabled: false, // do not run for non-admins
  });
};
