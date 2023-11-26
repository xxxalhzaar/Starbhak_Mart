$(document).ready(function() {
    // Mengatur animasi untuk tampilan input pencarian saat ikon pencarian diklik
    $('#searchIcon').on('click', function() {
        $('#searchInput').fadeToggle('fast');
        $('#searchInput').focus(); // memberi fokus pada input setelah muncul
    });

    // Fungsi pencarian item
    $('#searchInput').on('keyup', function() {
        var value = $(this).val().toLowerCase();
        $('.isi').filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });

    // Menyembunyikan input pencarian saat kehilangan fokus atau tombol esc ditekan
    $('#searchInput').on('focusout', function() {
        $(this).fadeOut('fast');
    });

    $(document).on('keydown', function(event) {
        if (event.key === 'Escape') {
            $('#searchInput').fadeOut('fast');
        }
    });
});
