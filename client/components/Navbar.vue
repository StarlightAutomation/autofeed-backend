<template>
  <nav class="bg-white shadow">
    <div class="w-full md:w-2/3 ml-auto mr-auto md:px-0 px-3">
      <div class="flex justify-between h-16">
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            DIYAutoFeed
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <nuxt-link
              v-for="item in nav"
              :key="item.id"
              :to="item.href"
              class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
            >{{ item.text }}</nuxt-link>
          </div>
        </div>

        <div class="-mr-2 flex items-center sm:hidden">
          <!-- Mobile menu button -->
          <button
            type="button"
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            aria-controls="mobile-menu"
            aria-expanded="false"
            @click="menuOpen = !menuOpen"
          >
            <font-awesome-icon :icon="['fas', 'bars']" />
          </button>
        </div>
      </div>
    </div>
    <div class="sm:hidden" id="mobile-menu" v-if="menuOpen">
      <div class="pt-2 pb-3 space-y-1">
        <nuxt-link
          v-for="item in nav"
          :key="item.id"
          :to="item.href"
          class="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
        >{{ item.text }}</nuxt-link>
      </div>
    </div>
  </nav>
</template>
<script>
export default {
  name: 'Navbar',
  data () {
    return {
      nav: [
        {
          id: 'dashboard',
          text: 'Dashboard',
          icon: '',
          href: '/',
        },
        {
          id: 'gpio-config',
          text: 'GPIO Configuration',
          icon: '',
          href: '/gpio-config',
        }
      ],
      menuOpen: false,
    };
  },
};
</script>
