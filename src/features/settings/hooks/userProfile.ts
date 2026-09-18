import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getProfile, uploadAvatar } from "../services/profileService"

export const useProfile = (userId:string|undefined) => {
    return useQuery({
        queryKey:["profile",userId],
        queryFn:()=>getProfile(userId as string),
        enabled: !!userId
    })
}
export const useUpdateAvatar = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn:uploadAvatar,
        onSuccess:(data,variables) => {
            queryClient.invalidateQueries({queryKey:["profile",variables.userId]})
        }
    })
}