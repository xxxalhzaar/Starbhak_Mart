$(document).ready(function () {
    var isTaxApplied = true;
    var itemQuantity = {};
    var initialItemPrices = {}; // Simpan harga awal item
    var itemPrices = {}; // Tambahkan daftar harga item

    function hitungTotalSetelahPajak(totalSebelumPajak) {
        var pajak = isTaxApplied ? totalSebelumPajak * 0.1 : 0; // Periksa apakah pajak harus diterapkan
        var totalSetelahPajak = totalSebelumPajak + pajak;
        return {
            pajak: pajak,
            totalSetelahPajak: totalSetelahPajak
        };
    }

    function updateTotal(total) {
        $('#totalPrice').text('Rp. ' + total.toLocaleString('id-ID'));
    }

    function updatePajak(pajak) {
        $('#taxDiscount').text('Rp. ' + pajak.toLocaleString('id-ID'));
    }

    function updateTotalAmount(totalAmount) {
        $('#totalAmount').text('Rp. ' + totalAmount.toLocaleString('id-ID'));
    }

    function updateTotalAfterQuantityChange() {
        var totalPrice = 0;
        for (var item in itemQuantity) {
            totalPrice += itemPrices[item] * itemQuantity[item];
        }

        var {
            pajak,
            totalSetelahPajak
        } = hitungTotalSetelahPajak(totalPrice);
        updateTotal(totalPrice);
        updatePajak(pajak);
        updateTotalAmount(totalSetelahPajak);
    }

    $('#deliveryOption').on('change', function () {
        var selectedOption = $(this).val();

        if (selectedOption === 'take') {
            isTaxApplied = false; // Jika opsi "take" dipilih, set pajak menjadi tidak diterapkan
        } else if (selectedOption === 'deli') {
            isTaxApplied = true; // Jika opsi "deli" dipilih, tetapkan pajak diterapkan
        }

        updateTotalAfterQuantityChange(); // Panggil fungsi untuk memperbarui total setelah perubahan
    });

    $('.isi').on('click', function () {

        var $clickedItem = $(this);
        var itemName = $clickedItem.find('p').first().text().trim();
        var itemPriceText = $clickedItem.find('h1').text().trim();
        var itemPrice = parseFloat(itemPriceText.replace('Rp. ', '').replace('.', '').replace(',', '.'));

        if (!isNaN(itemPrice)) {
            var formattedItemName = itemName.replace(/\s+/g, '_').toLowerCase();

            if (!itemQuantity[formattedItemName]) {
                itemQuantity[formattedItemName] = 1;
                itemPrices[formattedItemName] = itemPrice; // Tambahkan harga item
                initialItemPrices[formattedItemName] = itemPrice; // Simpan harga awal item
                var newElement = `
                    <div class="barang">
                        <div class="detail-kiri">
                            <p>${itemName}</p>
                            <p class="normal">Unit Price: Rp. ${itemPrice.toLocaleString('id-ID')}</p>
                        </div>
                        <div class="detail-kanan">
                            <p style="text-align: right; font-size: small;">${itemPriceText}</p>
                            <p class="normal" style="display: flex; justify-content: space-between; gap: 4em;">
                                Quantity: <span id="stock_${formattedItemName}">${itemQuantity[formattedItemName]}</span>
                            </p>
                        </div>
                        <button class="remove">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                `;
                $('.belanja').append(newElement);
                updateTotalAfterQuantityChange(); // Hitung ulang total setelah menambah item
            } else {
                itemQuantity[formattedItemName]++;
                var updatedItemPrice = itemPrice * itemQuantity[formattedItemName]; // Hitung harga item yang baru
                itemPrices[formattedItemName] = itemPrice; // Perbarui harga item di dalam objek itemPrices
                $('#stock_' + formattedItemName).text(itemQuantity[formattedItemName]); // Update tampilan jumlah
                $('.belanja .barang').each(function () {
                    var currentItemName = $(this).find('.detail-kiri p').first().text().trim();
                    if (currentItemName === itemName) {
                        $(this).find('.detail-kiri .normal').text('Unit Price: Rp. ' + updatedItemPrice.toLocaleString('id-ID')); // Update tampilan harga
                    }
                });
                updateTotalAfterQuantityChange(); // Hitung ulang total setelah mengubah kuantitas
            }
        } else {
            console.error('Harga item tidak valid');
        }
    });

    $('.belanja').on('click', '.remove', function () {
        var $item = $(this).closest('.barang');
        var itemNameElement = $item.find('.detail-kiri p').first();
        var itemName = itemNameElement.text().trim();
        var itemPriceText = $item.find('.detail-kiri .normal').text().trim();
        var itemPrice = parseFloat(itemPriceText.replace('Unit Price: Rp. ', '').replace('.', '').replace(',', '.'));

        if (!isNaN(itemPrice)) {
            var formattedItemName = itemName.replace(/\s+/g, '_').toLowerCase();
            var quantityElement = $('#stock_' + formattedItemName);
            var currentQuantity = parseInt(quantityElement.text());

            if (currentQuantity > 1) {
                currentQuantity--;
                quantityElement.text(currentQuantity);
                itemQuantity[formattedItemName]--; // Kurangi jumlah kuantitas

                // Perbarui harga item pada "Unit Price"
                var updatedItemPrice = initialItemPrices[formattedItemName] * currentQuantity;
                $item.find('.detail-kiri .normal').text('Unit Price: Rp. ' + updatedItemPrice.toLocaleString('id-ID'));

                // Perbarui total setelah perubahan kuantitas
                updateTotalAfterQuantityChange();

            } else if (currentQuantity === 1) {
                // Penanganan jika kuantitas adalah 1
                delete itemQuantity[formattedItemName];
                delete itemPrices[formattedItemName];
                $item.remove();
                updateTotalAfterQuantityChange();

                // Periksa total jumlah dari semua barang
                var totalAmount = calculateTotalAmount();

                // Jika total amount menjadi 0, sembunyikan div kiri
                if (totalAmount === 0) {
                    $(".kiri").css({
                        'display': 'none',
                        'position': 'absolute'
                    });
                    $(".kanan").css("width", "100%"); 
                    $(".isi").css("width", "129px");
                }
                
            }
        } else {
            console.error('Harga item tidak valid');
        }
    });

    function calculateTotalAmount() {
        var total = 0;
        $('.belanja .barang').each(function () {
            var $item = $(this);
            var itemPriceText = $item.find('.detail-kiri .normal').text().trim();
            var itemPrice = parseFloat(itemPriceText.replace('Unit Price: Rp. ', '').replace('.', '').replace(',', '.'));
            var quantity = parseInt($item.find('.quantity').text().trim());
            total += itemPrice * quantity;
        });
        return total;
    }



});