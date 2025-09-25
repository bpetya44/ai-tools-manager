# AI Vibecoding Academy - Laravel PHP Dockerfile
# Public images only - no private dependencies

FROM php:8.2-fpm-alpine

LABEL project="AI Vibecoding Academy Starter Kit"
LABEL maintainer="AI Vibecoding Academy"

# Install system dependencies
RUN apk add --no-cache \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    oniguruma-dev \
    supervisor \
    nginx \
    mysql-client \
    git \
    unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    pdo_mysql \
    mysqli \
    gd \
    zip \
    bcmath \
    pcntl \
    mbstring

# Install Redis extension
RUN apk add --no-cache --virtual .phpize-deps $PHPIZE_DEPS \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .phpize-deps

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Create laravel user
RUN addgroup -g 1000 laravel && adduser -u 1000 -G laravel -s /bin/sh -D laravel

# Copy project-specific configurations
COPY docker/php.ini /usr/local/etc/php/conf.d/project.ini
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create mbstring configuration to suppress deprecated warnings
RUN echo "; mbstring configuration - suppress deprecated warnings" > /usr/local/etc/php/conf.d/99-mbstring.ini && \
    echo "mbstring.language = neutral" >> /usr/local/etc/php/conf.d/99-mbstring.ini && \
    echo "mbstring.encoding_translation = Off" >> /usr/local/etc/php/conf.d/99-mbstring.ini && \
    echo "; Explicitly unset deprecated settings" >> /usr/local/etc/php/conf.d/99-mbstring.ini && \
    echo "mbstring.internal_encoding =" >> /usr/local/etc/php/conf.d/99-mbstring.ini && \
    echo "mbstring.http_input =" >> /usr/local/etc/php/conf.d/99-mbstring.ini && \
    echo "mbstring.http_output =" >> /usr/local/etc/php/conf.d/99-mbstring.ini

# Set working directory and permissions
WORKDIR /var/www/html
RUN chown -R laravel:laravel /var/www

# Switch to laravel user
USER laravel

# Expose PHP-FPM port
EXPOSE 9000

# Start PHP-FPM
CMD ["php-fpm"]