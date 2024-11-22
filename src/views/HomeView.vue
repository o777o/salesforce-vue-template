<script setup lang="ts">
import request from '@/request/BusinessPage'

// request('test', [])
</script>

<template>
  <main>
    <el-card style="max-width: 480px">
      <p v-for="o in 4" :key="o" class="text item">{{ 'List item ' + o }}</p>
    </el-card>
    {{ a }}
  </main>
</template>
