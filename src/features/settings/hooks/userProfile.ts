import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getProfile, uploadAvatar } from "../services/profileService"
import { data } from "react-router-dom"

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
        onSuccess:(_data,variables) => {
            queryClient.invalidateQueries({queryKey:["profile",variables.userId]})
            return data
        }
    })
}