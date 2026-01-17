// Animate collection items on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            // Stagger the animation for each item
            setTimeout(() => {
                entry.target.classList.add('animate');
            }, index * 100);
        }
    });
}, observerOptions);

// Observe all collection items
const collectionItems = document.querySelectorAll('.collection-item');
collectionItems.forEach(item => {
    observer.observe(item);
});

function observeCollectionItems() {
    const collectionItems = document.querySelectorAll('.collection-item');
    collectionItems.forEach(item => observer.observe(item));
}

observeCollectionItems();

// Category tags functionality
const categoryTags = document.querySelectorAll('.category-tag');
categoryTags.forEach(tag => {
    tag.addEventListener('click', function () {
        categoryTags.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        const categoryId = this.dataset.categoryId;

        $.ajax({
            url: "/Home/ChangeCategory",
            type: "GET",
            data: { categoryId: categoryId },
            success: function (res) {
                $("#filter-section").html(res.filters);
                $("#collectionsGrid").html(res.products);
                observeCollectionItems();
            }

        })
        const categoryName = this.textContent;
        const currentUrl = window.location.href;

        const modifyCurrentUrl = currentUrl.split("/")

        if (categoryName != "All Collections") {

            history.replaceState(null, "", "/" + modifyCurrentUrl[3] + "/" + modifyCurrentUrl[4] + "/" + categoryId);
        } else {
            history.replaceState(null, "", "/" + modifyCurrentUrl[3] + "/" + modifyCurrentUrl[4]);
        }
    });
});

const selectedFilters = {
    fabric: null,
    occasion: null,
    color: null
};

// 2️⃣ Event listeners
document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', function () {
        const categoryId = $("#categoryId").val();
        //alert(categoryId);
        const filterType = this.dataset.filter;
        const filterValue = this.dataset.value;

        const parent = this.parentElement;
        parent.querySelectorAll('.filter-btn')
            .forEach(btn => btn.classList.remove('active'));

        this.classList.add('active');

        selectedFilters[filterType] = filterValue;

        $.ajax({
            url: "/Home/Filter",
            type: "GET",
            data: {
                categoryId: categoryId,
                fabric: selectedFilters.fabric,
                occasion: selectedFilters.occasion,
                color: selectedFilters.color,
                minPrice: document.getElementById('minPrice').value,
                maxPrice: document.getElementById('maxPrice').value
            },
            success: function (html) {
                //alert("hell")
                console.log(html)
                $("#collectionsGrid").html(html);

                observeCollectionItems();
            }
        });

        //console.log(selectedFilters);
    });
});
document.getElementById('minPrice').addEventListener('input', function () {
    const min = parseFloat(this.value) || 0;
    const max = parseFloat(document.getElementById('maxPrice').value) || 0;

    if (min > max && max > 0) {
        this.value = max - 1; // auto-correct minPrice to maxPrice
    }
});

document.getElementById('maxPrice').addEventListener('input', function () {
    const max = parseFloat(this.value) || 0;
    const min = parseFloat(document.getElementById('minPrice').value) || 0;

    if (max < min && min > 0) {
        this.value = min + 1; // auto-correct maxPrice to minPrice
    }
});

function debounce(func, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    }
}

const priceInputs = document.querySelectorAll('#minPrice, #maxPrice');

priceInputs.forEach(input => {
    input.addEventListener('input', debounce(function () {
        const categoryId = $("#categoryId").val();
        $.ajax({
            url: "/Home/Filter",
            type: "GET",
            data: {
                categoryId: categoryId,
                fabric: selectedFilters.fabric,
                occasion: selectedFilters.occasion,
                color: selectedFilters.color,
                minPrice: document.getElementById('minPrice').value,
                maxPrice: document.getElementById('maxPrice').value
            },
            success: function (html) {
                //alert("hello")
                //console.log(html)
                $("#collectionsGrid").html(html);
                //$("#collectionsGrid").html('<div style="width:100px;height:100px;background:red;"></div>');
                observeCollectionItems(); // scroll animation fir se attach
            }
        });
    }, 500)); // 500ms debounce
});

//$(document).ready(function () {
//    // Code to run when the DOM is ready
//    $(".cart-btn").on("click", function (e) {
//        var productId = $(this).data("productId");
//        const currentUrl = window.location.href;
//        $.ajax({
//            url: "/Cart/Index",
//            type: "POST",
//            data: { productId: productId, currentUrl: currentUrl },
//            success: function (response) {
//                console.log(response);
//                if (!response.success) {
//                    window.location.href = `${response.redirect}`;
//                } else {
//                    showNotification(response.message, "success");
//                }
//            }
//        })
//    })
//});
