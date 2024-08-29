<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input,  } from '@/components/ui/input'
import { ref } from 'vue';
import { toast } from 'vue-sonner'
import { Toaster } from '@/components/ui/sonner'
import { BiliApi } from './api/BiliApi';

const url = ref<string>('');
const downloadUrl = ref<Array<any>>([]);

async function handleClick() {

  downloadUrl.value = await getDownloadUrl();

  console.log(url);

}

function getBvid(url: string) : string{
  // 定义正则表达式
  const regex: RegExp = /video\/(BV[a-zA-Z0-9]+)/;
  // 使用exec方法提取BV号
  const match: RegExpExecArray | null = regex.exec(url);
  if (match) {
    return match[1]; 
  } else {
    toast.error('解析失败, 请检查url是否正确');
    throw new Error("bid解析失败")
  }
}

async function getAvidAndCid() {
  const bvid: string = getBvid(url.value);

  const data = await BiliApi.webInterface(bvid)
  console.log(data);

  const videos = [];
  for(const page of data.pages) {
    console.log(page.cid);
    videos.push({ cid: page.cid, part: page.part });
  }

  return { aid: data.aid, videos };
}

async function getDownloadUrl() {
  const a = await getAvidAndCid();

  const url = [];
  for (const video of a.videos) {
    const data = await BiliApi.player(a.aid, video.cid);
    console.log(data);
    url.push({
      url: data.durl[0].url,
      part: video.part
    });
  }

  return url;
}

</script>

<template>
  <div class="w-9/12">
    <Input v-model.trim="url" />
    <Button @click="handleClick">解析</Button>
    
    <div>
      <ul v-for="url in downloadUrl">
        <a :href="url.url">{{ url.part }}</a>
      </ul>
    </div>
  </div>
  <Toaster richColors position="top-center" />
</template>

<style scoped>

</style>
