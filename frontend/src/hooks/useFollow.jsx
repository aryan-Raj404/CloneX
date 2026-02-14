import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useFollow = () => {
  const queryClient = useQueryClient();

  const { mutate: follow, isPending } = useMutation({
    mutationFn: async ({id, username}) => {
      try {
        const res = await fetch(`/api/user/follow/${id}`, { method: "POST" });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Something went wrong");
        }

        return {data , username};
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: async ({data,username}) => {
      try {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
          queryClient.invalidateQueries({ queryKey: ["authUser"] }),
        ]);

        const isFollowing = data?.message?.toLowerCase().includes("unfollowed");

        toast.success(
          isFollowing
            ? `👋 You unfollowed ${username}` 
            : `🎉 You’re now following ${username}`
        );
      } catch (error) {
        toast.error("Something went wrong. Please try again.");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return { follow, isPending };
};

export default useFollow;
