<template>
  <div ref="main" :class="mainClass">
    <div v-if="loading" class="h-screen w-full bg-gray-300">
      <div class="w-full text-center ml-auto mr-auto text-blue-500">
        <font-awesome-icon
          :icon="['fas', 'spinner']"
          spin
          size="5x"
          class="mt-16"
        />
      </div>
    </div>
    <div v-else :class="bodyClass">
      <Navbar
        :lighting-mode="lightingMode"
        @lightingMode="toggleLightingMode"
      />
      <Nuxt />
    </div>
  </div>
</template>
<script>
import Navbar from "../components/Navbar";
export default {
  components: {
    Navbar,
  },
  data () {
    return {
      loading: true,
      sidebarOpen: false,
      lightingMode: 'light',
    };
  },

  computed: {
    topnavClass () {
      let style = [
        'flex-shrink-0',
      ];

      return style.join(' ');
    },
    bodyClass () {
      let style = [
        'antialiased',
        'sm:subpixel-antialiased',
        'md:antialiased',
        'dark:bg-cool-gray-900',
        'dark:text-gray-100',
        'min-h-screen',
      ];

      return style.join(' ');
    },
    mainClass () {
      return this.lightingMode;
    },
  },

  methods: {
    toggleSidebar () {
      this.sidebarOpen = !this.sidebarOpen;
    },
    toggleLightingMode (mode) {
      this.lightingMode = mode;
      if (process.client) {
        localStorage.setItem('lightingMode', mode);
      }
    },
    openSidebar () {
      this.sidebarOpen = true;
    },
  },

  mounted () {
    if (process.client) {
      this.lightingMode = localStorage.getItem('lightingMode') || 'light';
    }

    this.$store.dispatch('api/getConfig').then((res) => {
      this.loading = false;
    });
  },
};
</script>
