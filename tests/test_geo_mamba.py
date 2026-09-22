"""
Unit tests for Layer 2: Geo-Mamba 3.0 Linear Backbone & SIRTI Scale Token Injection.
"""

from param_brahmand.models.geo_mamba import SIRTIEmbedding, GeoMamba2DBlock, GeoMambaModel

def test_sirti_embedding_dimension():
    sirti = SIRTIEmbedding(embed_dim=64, gsd_ref=10.0)
    emb = sirti.forward(gsd_m=2.5, sun_el_deg=52.0, zenith_deg=38.0)
    assert len(emb) == 64

def test_geomamba_bidirectional_scan():
    ssm = GeoMamba2DBlock(d_model=64)
    grid = [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0], [7.0, 8.0, 9.0]]
    scanned = ssm.scan_2d_bidirectional(grid)
    assert len(scanned) == 3
    assert len(scanned[0]) == 3
    # Check that spatial features propagate smoothly
    assert scanned[1][1] > 0

def test_geomamba_model_tile_processing():
    model = GeoMambaModel(embed_dim=64)
    grid = [[0.5] * 4 for _ in range(4)]
    res = model.process_tile(grid, gsd_m=0.28, sun_el_deg=45.0, zenith_deg=45.0)
    assert res["model"] == "Geo-Mamba 3.0 SSM"
    assert res["tile_dimensions"] == [4, 4]
    assert len(res["sirti_embedding_sample"]) == 8
