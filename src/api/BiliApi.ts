
export class BiliApi {

    // nginx 地址
    static BASE_URL = 'https://116.198.47.116:7778';

    static async webInterface(bvid: string) {
        const res: any = await fetch(`${this.BASE_URL}/x/web-interface/view?bvid=${bvid}`, {mode: "cors"});
        const body = await res.json();
        return body.data;
    }

    static async player(aid: string, cid: string) {
        const res: any = await fetch(`${this.BASE_URL}/x/player/playurl?avid=${aid}&cid=${cid}&qn=80&type=mp4&platform=html5&high_quality=1`, {
            credentials: 'include',
        });
        const body = await res.json();
        return body.data;
    }

    static async getLoginUrl() {
        const res: any = await fetch(`${this.BASE_URL}/passport/x/passport-login/web/qrcode/generate`);
        const body = await res.json();
        return body.data;
    }
    
    static async getLoginStatus(qrcodeKey: string) {
        const res: any = await fetch(`${this.BASE_URL}/passport/x/passport-login/web/qrcode/poll?qrcode_key=${qrcodeKey}`);
        const body = await res.json();
        return body.data;
    }

    static async login(url: string) {
        url = url.replace('https://passport.bilibili.com', `${this.BASE_URL}/passport`);
        const res: any = await fetch(url);
        const body = await res.text();

        console.log(body);
    }

}