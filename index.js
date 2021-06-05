const apiUrl = "https://vue3-course-api.hexschool.io";
const apiPath = "caesar";

let productModal = null;
let delProductModal = null;

let vm = Vue.createApp({
  data() {
    return {
      products: [],
      tempProduct: {
        imagesUrl: [],
      },
      pagination: {},
      isNew: false,
    };
  },
  methods: {
    async getProducts(page = 1) {
      const url = `${apiUrl}/api/${apiPath}/admin/products?page=${page}`;
      try {
        let { data } = await axios.get(url);
        console.log(data)
        if (!data.success) {
          throw new Error("抓取資料錯誤");
        }
        this.products = data.products;
        this.pagination = data.pagination
      } catch (err) {
        window.alert("抓取資料錯誤");
      }
    },
    openModal(isNew) {
      if (isNew === "new") {
        this.tempProduct = {
          imagesUrl: [],
        };
        this.isNew = true;
        productModal.show();
      }
    },
    getTempProduct(value) {
      this.tempProduct = value;
    },
  },
  created() {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location = "./login.html";
    }
    axios.defaults.headers.common.Authorization = token;

    this.getProducts();
  },
  mounted() {
    productModal = new bootstrap.Modal(
      document.getElementById("productModal"));
    delProductModal = new bootstrap.Modal(
      document.getElementById("delProductModal"));
  },
});

vm.component("products-list", {
  template: "#productsListTamplate",
  props: {
    products:{
      type:Object,
      required:true
    }
  },
  methods: {
    openModal(isNew, item) {
      if (isNew === "edit") {
        this.$emit("updateProduct", item);
        productModal.show();
      } else if (isNew === "delete") {
        this.$emit("updateProduct", item);
        delProductModal.show();
      }
    },
  },
});
// 分頁元件
vm.component("pagination", {
  template: "#pagination",
  props: {
    pages: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  methods: {
    emitPages(item) {
      this.$emit("emit-pages", item);
    },
  },
});
// 產品新增/編輯元件
vm.component("product-modal", {
  template: "#productModalTamplate",
  props: {
    tempProduct: {
      type: Object,
      default() {
        return {
          imagesUrl: [],
        };
      },
    },
    isNew: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      modal: null,
    };
  },
  methods: {
    async updateProduct() {
      try {
        let api = `${apiUrl}/api/${apiPath}/admin/product`;
        let httpMethod = "post";
        if (!this.isNew) {
          api = `${apiUrl}/api/${apiPath}/admin/product/${this.tempProduct.id}`;
          httpMethod = "put";
        }
        let  { data }  = await axios[httpMethod](api, { data: this.tempProduct });
        if (data.success) {
          alert(data.message);
          this.hideModal();
          this.$emit("update");
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.log(error);
      }
    },
    createImages() {
      this.product.imagesUrl = [];
      this.product.imagesUrl.push("");
    },
    openModal() {
      productModal.show();
    },
    hideModal() {
      productModal.hide();
    },
  },
});
// 產品刪除元件
vm.component("del-product-modal", {
  template: "#delProductModalTamplate",
  props: {
    tempProduct:{
      type:Object,
      required:true
    }
  },
  data() {
    return {
      modal: null,
    };
  },
  methods: {
    delProduct() {
      axios.delete(`${apiUrl}/api/${apiPath}/admin/product/${this.tempProduct.id}`).then((response) => {
        console.log(response)
        if(response.data.success){
          alert(response.data.message);
          this.hideModal();
          this.$emit('update');
        } else {
          alert(response.data.message);
        }
      }).catch((error) => {
        console.log(error);
      });
    },
    openModal() {
      delProductModal.show();
    },
    hideModal() {
      delProductModal.hide();
    },
  },
});
vm.mount("#app");
