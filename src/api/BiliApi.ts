
export class BiliApi {

    // nginx 地址
    static BASE_URL = 'http://localhost:7777';

    static async webInterface(bvid: string) {
        const res: any = await fetch(`${this.BASE_URL}/x/web-interface/view?bvid=${bvid}`, {mode: "cors"});
        const body = await res.json();
        return body.data;
    }

    static async player(aid: string, cid: string) {
        const res: any = await fetch(`${this.BASE_URL}/x/player/playurl?avid=${aid}&cid=${cid}&qn=80&type=mp4&platform=html5&high_quality=1`);
        const body = await res.json();
        return body.data;
    }

}