// サマーウォーズ OZ World Clock - 地球儀描画
// D3.jsを使った正射図法による二重レイヤー描画

function initGlobe() {
    const width = 550;
    const height = 550;
    const sensitivity = 75;

    // SVGコンテナ作成
    const svg = d3.select("#globe-svg")
        .attr("width", width)
        .attr("height", height);

    // 正射図法（Orthographic projection）
    const projection = d3.geoOrthographic()
        .scale(270)
        .center([0, 0])
        .rotate([0, -23.4, 0])  // 地軸の傾き23.4度
        .translate([width / 2, height / 2]);

    const initialScale = projection.scale();
    const path = d3.geoPath().projection(projection);

    // 球体（海洋）
    svg.append("circle")
        .attr("class", "sphere")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", initialScale);

    // グループ要素
    const globe = svg.append("g");

    // GeoJSONデータを読み込んで描画
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
        .then(function(world) {
            const countries = topojson.feature(world, world.objects.countries);

            // 背面レイヤー（裏側の大陸） - clipAngle(180)
            const backProjection = d3.geoOrthographic()
                .scale(270)
                .center([0, 0])
                .rotate([0, -23.4, 0])
                .translate([width / 2, height / 2])
                .clipAngle(180);  // 全球を描画

            const backPath = d3.geoPath().projection(backProjection);

            globe.append("g")
                .attr("class", "land-back-group")
                .selectAll("path")
                .data(countries.features)
                .enter()
                .append("path")
                .attr("class", "land-back")
                .attr("d", backPath);

            // 前面レイヤー（見える側の大陸） - clipAngle(90)
            const frontProjection = d3.geoOrthographic()
                .scale(270)
                .center([0, 0])
                .rotate([0, -23.4, 0])
                .translate([width / 2, height / 2])
                .clipAngle(90);  // 前面のみ描画

            const frontPath = d3.geoPath().projection(frontProjection);

            globe.append("g")
                .attr("class", "land-front-group")
                .selectAll("path")
                .data(countries.features)
                .enter()
                .append("path")
                .attr("class", "land-front")
                .attr("d", frontPath);

            // 回転アニメーション
            let rotation = 0;
            d3.timer(function(elapsed) {
                rotation = elapsed * 0.01;  // 回転速度調整

                const rotate = [rotation, -23.4, 0];

                // 背面レイヤー更新
                backProjection.rotate(rotate);
                globe.select(".land-back-group")
                    .selectAll("path")
                    .attr("d", backPath);

                // 前面レイヤー更新
                frontProjection.rotate(rotate);
                globe.select(".land-front-group")
                    .selectAll("path")
                    .attr("d", frontPath);
            });

        })
        .catch(function(error) {
            console.error("GeoJSON読み込みエラー:", error);
            // フォールバック: 簡易的な円を表示
            globe.append("circle")
                .attr("cx", width / 2)
                .attr("cy", height / 2)
                .attr("r", 200)
                .attr("fill", "#FD81DB")
                .attr("opacity", 0.5);
        });
}

// ページ読み込み時に初期化
if (typeof d3 !== 'undefined' && typeof topojson !== 'undefined') {
    initGlobe();
} else {
    console.error("D3.jsまたはTopoJSONが読み込まれていません");
}
