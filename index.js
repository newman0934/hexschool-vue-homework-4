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
      this.isNew = value.isNew
      this.tempProduct = value.item;
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
        let data = {
          isNew: false,
          item
        }
        this.$emit("updateProduct", data);
        productModal.show();
      } else if (isNew === "delete") {
        let data = {
          isNew:false,
          item
        }
        this.$emit("updateProduct", data);
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
      status:{}
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
    async uploadFile () {
      try {
        const uploadedFile = this.$refs.fileInput.files[0]
        console.log(uploadedFile)
        const formData = new FormData()
        formData.append('file-to-upload', uploadedFile)
        this.status.fileUploading = true
        const { data } = await axios.post(`${apiUrl}/api/${apiPath}/admin/upload`,formData,{
          headers:{
            'Content-Type': 'multipart/form-data',
          }
        })
        console.log(data)
        this.status.fileUploading = false
        if (!data.success) {
          throw new Error('上傳圖片失敗')
        }
        this.tempProduct.imageUrl = data.imageUrl
        this.$refs.fileInput.value = ''
      } catch (error) {
        window.alert(error.message)
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
