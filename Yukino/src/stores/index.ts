import { defineStore } from "pinia";
import { ref } from "vue";

export const useCounterStore = defineStore("counter", () => {
  const count = ref<number>(100);
  const increment = () => {
    count.value++;
  };
  return { count, increment };
});
