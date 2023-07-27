<?php
/*
 * Plugin Name: KPI-plugin
 */

 // Plugin Opitons
// Register the custom settings menu
function settings_plugin_menu() {
    add_options_page('KPI Plugin', 'KPI Plugin', 'manage_options', 'settings-plugin', 'settings_plugin_options');
}
add_action('admin_menu', 'settings_plugin_menu');

// Register and initialize the plugin settings
function settings_plugin_initialize() {
    add_settings_section('api_section', 'Api Settings', 'api_section_callback', 'settings-plugin');
    add_option('api_database');
    add_option('api_keys_url');
    add_option('api_data_url');
    add_option('api_key');
    add_option('api_secret');
    add_settings_field('api_keys_url_field', 'url for keys', 
    'api_keys_url_field_callback', 'settings-plugin', 'api_section');
    add_settings_field('api_data_url_field', 'url for data', 
    'api_data_url_field_callback', 'settings-plugin', 'api_section');
    add_settings_field('api_key_field', 'api-key', 
    'api_key_field_callback', 'settings-plugin', 'api_section');
    add_settings_field('api_secret_field', 'api-secret', 
    'api_secret_field_callback', 'settings-plugin', 'api_section');
    register_setting('settings-plugin', 'api_keys_url');
    register_setting('settings-plugin', 'api_data_url');
    register_setting('settings-plugin', 'api_key');
    register_setting('settings-plugin', 'api_secret');
}
add_action('admin_init', 'settings_plugin_initialize');

// Callback function for the settings section
function api_section_callback() {
    echo 'Data required for api conection';
}

// Callback functions for the settings field
function api_keys_url_field_callback() {
    $option_value = get_option('api_keys_url');
    echo '<input type="text" name="api_keys_url" value="' . esc_attr($option_value) . '" />';
}

function api_data_url_field_callback() {
    $option_value = get_option('api_data_url');
    echo '<input type="text" name="api_data_url" value="' . esc_attr($option_value) . '" />';
}

function api_key_field_callback() {
    $option_value = get_option('api_key');
    echo '<input type="text" name="api_key" value="' . esc_attr($option_value) . '" />';
}

function api_secret_field_callback() {
    $option_value = get_option('api_secret');
    echo '<input type="text" name="api_secret" value="' . esc_attr($option_value) . '" />';
}

// Callback function for the settings page
function settings_plugin_options() {
    ?>
    <div class="wrap">
        <h1>KPI Plugin Settings</h1>
        <h2>Refresh api data</h2>
            <button id="function-call-button" class="button button-primary">Refresh</button>
            <div id="function-call-result"></div>
        <form method="post" action="options.php">
            <?php
            settings_fields('settings-plugin');
            do_settings_sections('settings-plugin');
            submit_button();
            ?>
        </form>
    </div>
    <script>
    (function($) {
        $(document).ready(function() {
            // Handle button click event
            $('#function-call-button').click(function() {
                // Make an AJAX request to call the function
                $.ajax({
                    url: '<?php echo admin_url('admin-ajax.php'); ?>',
                    type: 'POST',
                    data: {
                        action: 'function_call_ajax', // AJAX action name
                        security: '<?php echo wp_create_nonce('function_call_ajax_nonce'); ?>' // Nonce for security
                    },
                    success: function(response) {
                        // Handle the AJAX response
                        $('#function-call-result').html(response);
                    },
                    error: function(xhr, status, error) {
                        console.error(error);
                    }
                });
            });
        });
    })(jQuery);
    </script>
    <?php
}

// Custom function to be called
function custom_function() {
    update_data();

    echo 'Data saved';
    exit; // Ensure to exit to prevent unwanted output
}

// AJAX handler for the function call
function function_call_ajax_handler() {
    check_ajax_referer('function_call_ajax_nonce', 'security');

    // Call the function
    custom_function();
}
add_action('wp_ajax_function_call_ajax', 'function_call_ajax_handler');
add_action('wp_ajax_nopriv_function_call_ajax', 'function_call_ajax_handler');

// Webhook
// http://codesnippetstest.local/webhook-endpoint?webhook-endpoint=asdf

// Register the webhook endpoint
function my_plugin_register_webhook_endpoint() {
    add_rewrite_endpoint('webhook-endpoint', EP_ROOT);
}
add_action('init', 'my_plugin_register_webhook_endpoint');

// Handle the webhook requests
function my_plugin_handle_webhook_request() {
    if (isset($_GET['webhook-endpoint'])) {
        // Process the webhook request
        do_action('my_plugin_refresh_data');
        
        // Send a response to the webhook request
        http_response_code(200);
        exit;
    }
}
add_action('template_redirect', 'my_plugin_handle_webhook_request');

// Implement the refresh functionality
function my_plugin_refresh_data_handler() {
    // Perform the data refresh process
    update_data();
    
    // Log the refresh event (optional)
    error_log('Data refreshed via webhook at ' . current_time('mysql'));
}
add_action('my_plugin_refresh_data', 'my_plugin_refresh_data_handler');





// Content
function dzisiaj_shortsode() {
    return date('d.m.Y');
}
add_shortcode('dzisiaj', 'dzisiaj_shortsode');

function get_keys() {
    // Set the url  adress
    $url = get_option('api_keys_url');

    // Set the request headers
    $headers = array(
        'Content-Type' => 'application/json',
        'api-key' => get_option('api_key'),
        'api-secret' => get_option('api_secret')
    );

    // Make the API request
    $response = wp_remote_get($url, array('headers' => $headers));

    // Check if API request was successful
    if (is_wp_error($response)) {
        return null;
    }

    // Get the response body as JSON
    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);

    return $data;
}

function update_data() {
    $data_arr = [];
    $keys = get_keys();

    // Set the request headers
    $headers = array(
        'Content-Type' => 'application/json',
        'api-key' => get_option('api_key'),
        'api-secret' => get_option('api_secret')
    );

    foreach ($keys as $key) {
        // Set the url adress
        $url = get_option('api_data_url') . $key['key'];

        // Make the API request
        $response = wp_remote_get($url, array('headers' => $headers));

        // Check if API request was successful
        if (is_wp_error($response)) {
            array_push($data_arr, 'Unable to retrieve data from the API.');
        }

        // Get the response body as JSON
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        $data_arr[$key['key']] = $data['value'];
    }

    update_option('api_database', $data_arr);
}

function get_external_content_shortcode($atts) {
    // Extract the shortcode attributes
    $atts = shortcode_atts(array(
        'key' => 'key'
    ), $atts);

    return get_option('api_database')[$atts['key']];
}

add_shortcode('get_external_content', 'get_external_content_shortcode');
?>