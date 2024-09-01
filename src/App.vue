<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input,  } from '@/components/ui/input'
import { ref } from 'vue';
import { toast } from 'vue-sonner'
import { Toaster } from '@/components/ui/sonner'
import { BiliApi } from './api/BiliApi';
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'

const url = ref<string>('');
const coverUrl = ref<string>('');

const title = ref<string>('');
const progress = ref<string>('')
const downloadimg = ref<boolean>(false);
const parseDone = ref<boolean>(false);

const videos = ref(new Map<string, any>());

// 解析按钮
async function handleClick() {

  progress.value = '0';
  downloadimg.value = false;
  parseDone.value = false;

  await getDownloadUrl();
  
  parseDone.value = true;
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

  // 封面url
  coverUrl.value = data.pic;
  title.value = data.title;

  for(const page of data.pages) {
    console.log(page.cid);
    // 获取每个视频的
    videos.value.set(page.cid, {part: page.part})
  }

  return data.aid;
}

async function getDownloadUrl() {
  const aid = await getAvidAndCid();

  for (const [cid, value] of videos.value) {
    const data = await BiliApi.player(aid, cid);
    videos.value.set(cid, { ...value, url: data.durl[0].url, progress: 0, checked: true})
  }

  console.log(videos);
}

async function download() {
  console.log(videos);

  downloadimg.value = true;

  for (const [cid, value] of videos.value) {
    if (value.checked) {
      try {
        await fetchAndDownloadVideo(value);
      } catch (e: any) {
        toast.error('视频下载失败！');
        throw new Error(e);
      }
    }
  }
}

async function fetchAndDownloadVideo(video: any): Promise<void> {
  console.log('正在下载...', video)
  try {
    const response = await fetch(video.url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const contentLength = parseInt(response.headers.get('Content-Length') || '0', 10);
    let downloaded = 0;
    const reader = response.body.getReader();
    const stream = new ReadableStream({
      start(controller: ReadableStreamDefaultController) {
        function push() {
          reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            controller.enqueue(value);
            downloaded += value.length;
            video.progress = (downloaded / contentLength * 100).toFixed(2);
            push();
          }).catch(error => {
            console.error('Stream reading error:', error);
            controller.error(error);
          });
        }
        push();
      }
    });

    const responseWithStream = new Response(stream, { headers: { 'Content-Type': 'video/mp4' } });
    const blob = await responseWithStream.blob();

    console.log('完成');

    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = 'video.mp4'; // 这里需要确保文件名和类型匹配
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

</script>

<template>
  <div class="w-9/12 m-auto mt-24">
    <div class="flex content-center">
      <Input v-model.trim="url" />
      <Button @click="handleClick">解析</Button>
    </div>
    <div v-if="parseDone">
      <div class="mt-12">
        <div class="flex">
          <img :src="coverUrl" width="300px" />
          <div>
            {{ title }}
          </div>
        </div>
      </div>
      <ul class="flex flex-col mt-6">
        <li v-for="[_, value] of videos" class="flex justify-between items-center">
          <div>
            <Checkbox :id="value.url" v-model:checked="value.checked" class="mr-2"/>
            <label :for="value.url">
              {{ value.part }}
            </label>
          </div>
          <Progress v-model="value.progress" class="w-1/5" v-if="downloadimg && value.checked" />
        </li>
      </ul>

      <Button @click="download">下载</Button>
    </div>

  </div>

  <Toaster richColors position="top-center" />
</template>

<style scoped>

</style>
