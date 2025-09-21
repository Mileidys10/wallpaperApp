export interface Userdata {
    name:string;
    lastName:string;
    wallpapers:wallpaper[];
}
interface wallpaper{
    path:string;
    url:string;
}