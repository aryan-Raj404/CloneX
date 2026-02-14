import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";


const useUpdateprofile = () => {
  const queryClient = useQueryClient();

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: async (formData) => {
      try {
        const res = await fetch("/api/user/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const data = await res.json();

        if (!res.ok) {
          console.log(data.error);
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        console.log(error);
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries(["userProfile"]);
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.message);
    },
  });
  return { update, isUpdating }
};

export default useUpdateprofile;
