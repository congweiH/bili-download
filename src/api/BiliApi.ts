
export class BiliApi {

    static async webInterface(bvid: string) {
        const res: any = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`);
        const body = await res.json();
        return body.data;
    }

    static async player(aid: string, cid: string) {
        const res: any = await fetch(`https://api.bilibili.com/x/player/playurl?avid=${aid}&cid=${cid}&qn=80&type=mp4&platform=html5&high_quality=1`);
        const body = await res.json();
        return body.data;
    }

}